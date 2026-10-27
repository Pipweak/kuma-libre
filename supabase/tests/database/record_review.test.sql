begin;

select plan(21);

insert into auth.users (id, aud, role, email)
values ('11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'one@example.com');

set local role authenticated;
set local "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';

select is((select count(*)::integer from public.profiles), 1, 'new users receive a private profile');
select lives_ok(
  $$select * from public.record_review(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'lesson-01-vocabulary-001', 'japanese_to_meaning',
    '{"kind":"japanese","kana":["わたし"],"kanji":["私"]}', 'je', 'je', 'correct', 900
  )$$,
  'first review is recorded'
);
select is((select mastery_score::integer from public.word_progress), 1, 'first success reaches score one');
select results_eq(
  $$select correct_total, incorrect_total from public.word_progress$$,
  $$values (1, 0)$$,
  'success counters are updated'
);
select is((select count(*)::integer from public.review_events), 1, 'one immutable event is stored');

select lives_ok(
  $$select * from public.record_review(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'lesson-01-vocabulary-001', 'japanese_to_meaning',
    '{"kind":"japanese","kana":["わたし"],"kanji":["私"]}', 'je', 'je', 'correct', 900
  )$$,
  'retrying the same review is accepted'
);
select is((select mastery_score::integer from public.word_progress), 1, 'an idempotent retry does not advance mastery');
select is((select count(*)::integer from public.review_events), 1, 'an idempotent retry does not duplicate history');

select lives_ok(
  $$select * from public.record_review(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'lesson-01-vocabulary-001', 'japanese_to_meaning',
    '{"kind":"japanese","kana":["わたし"],"kanji":["私"]}', 'I', 'i', 'correct', null
  )$$,
  'second success is recorded'
);
select is((select mastery_score::integer from public.word_progress), 2, 'second success reaches score two');
select lives_ok(
  $$select * from public.record_review(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'lesson-01-vocabulary-001', 'japanese_to_meaning',
    '{"kind":"japanese","kana":["わたし"],"kanji":["私"]}', 'yo', 'yo', 'correct', 750
  )$$,
  'third success is recorded'
);
select is((select mastery_score::integer from public.word_progress), 3, 'third success reaches green');
select lives_ok(
  $$select * from public.record_review(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'lesson-01-vocabulary-001', 'japanese_to_meaning',
    '{"kind":"japanese","kana":["わたし"],"kanji":["私"]}', 'wrong', 'wrong', 'incorrect', 500
  )$$,
  'an incorrect answer is recorded'
);
select results_eq(
  $$select mastery_score::integer, incorrect_total from public.word_progress$$,
  $$values (2, 1)$$,
  'an error demotes green to yellow'
);
select lives_ok(
  $$select * from public.record_review(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', 'lesson-01-vocabulary-001', 'japanese_to_meaning',
    '{"kind":"japanese","kana":["わたし"],"kanji":["私"]}', 'je', 'je', 'correct', 600
  )$$,
  'a success after demotion is recorded'
);
select results_eq(
  $$select mastery_score::integer, correct_total from public.word_progress$$,
  $$values (3, 4)$$,
  'one success restores green'
);

reset role;
insert into auth.users (id, aud, role, email)
values ('22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'two@example.com');
set local role authenticated;
set local "request.jwt.claim.sub" = '22222222-2222-2222-2222-222222222222';

select lives_ok(
  $$select * from public.record_review(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'lesson-01-vocabulary-001', 'meaning_to_japanese',
    '{"kind":"meaning","locale":"fr","text":"je"}', 'watashi', 'watashi', 'correct', 800
  )$$,
  'a second user can record their own review'
);
select is((select count(*)::integer from public.review_events), 1, 'RLS hides the first user review history');
select is((select count(*)::integer from public.word_progress), 1, 'RLS hides the first user progress');

reset role;
set local role authenticated;
set local "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';

select is((select count(*)::integer from public.review_events), 5, 'the first user sees only their five events');
select is((select count(*)::integer from public.word_progress), 1, 'the first user sees only their progress row');

select * from finish();
rollback;
