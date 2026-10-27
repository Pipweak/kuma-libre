begin;

select plan(11);

select has_table('public', 'profiles', 'profiles exists');
select has_table('public', 'user_preferences', 'user_preferences exists');
select has_table('public', 'review_events', 'review_events exists');
select has_table('public', 'word_progress', 'word_progress exists');
select has_function(
  'public',
  'record_review',
  array['uuid', 'text', 'text', 'jsonb', 'text', 'text', 'text', 'integer'],
  'record_review exists'
);

select ok((select relrowsecurity from pg_class where oid = 'public.profiles'::regclass), 'profiles uses RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.user_preferences'::regclass), 'preferences use RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.review_events'::regclass), 'review events use RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.word_progress'::regclass), 'word progress uses RLS');

select ok(
  has_function_privilege(
    'authenticated',
    'public.record_review(uuid,text,text,jsonb,text,text,text,integer)',
    'execute'
  ),
  'authenticated can execute record_review'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.record_review(uuid,text,text,jsonb,text,text,text,integer)',
    'execute'
  ),
  'anonymous users cannot execute record_review'
);

select * from finish();
rollback;
