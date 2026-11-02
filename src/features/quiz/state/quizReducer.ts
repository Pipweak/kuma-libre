import type { QuizAction, QuizUiState } from './quizState';

/** Controls the local answering/correction state without persisting a resumable session. */
export function quizReducer(state: QuizUiState, action: QuizAction): QuizUiState {
  if (action.type === 'answer-changed') {
    return state.feedback === null ? { ...state, answer: action.answer } : state;
  }

  if (action.type === 'answer-evaluated') {
    if (state.feedback !== null) {
      return state;
    }

    return {
      ...state,
      correctCount: state.correctCount + (action.feedback.isCorrect ? 1 : 0),
      feedback: action.feedback,
      incorrectCount: state.incorrectCount + (action.feedback.isCorrect ? 0 : 1),
    };
  }

  if (state.feedback === null) {
    return state;
  }

  return {
    ...state,
    answer: '',
    currentIndex: state.currentIndex + 1,
    feedback: null,
  };
}
