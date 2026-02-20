export interface Option {
  id: number
  text: string
  isCorrect?: boolean
}

export interface Question {
  id: string
  test_series_id: string
  test_id: string
  question: string
  options: string[]
  option_1: string
  option_2: string
  option_3: string
  option_4: string
  answer: string
  solution_text: string
  section_id: string
  positive_marks: string
  negative_marks: string
}

export interface TestTitle {
  id: string
  title: string
  test_series_id: string
  free_flag?: any
  time: string
  questions: string
  test_solutions_video: string
  test_solutions_link: string
  show_solutions_video: string
  marks: string
  partial_marking: string
  partial_scoring_scheme: string
  is_completed: boolean
  is_test_attempted: boolean
  pdf_url: string
  save_flag: string
  show_result: string
  result_date_time: string
  show_rank: string
  show_solutions: string
  show_pause: string
  attempt_enabled: string
  max_test_attempt: string
  attempt_mandatory: string
  date_time: string
  upcoming_date_time: string
  enddatetime: string
  shuffle_questions: string
  shuffle_options: string
  show_sectionselector: string
  minimumsection: string
  maximumsection: string
  password: string
  telegram_link: string
  telegram_rank: string
  telegram_score: string
  cutoff_score: string
  enable_calculator: string
  enable_questionpaper: string
  ui_type: string
  show_total_students: string
  show_percentile: string
  show_solutions_image: string
  test_solutions_image: string
  show_solutions_pdf: string
  test_solutions_pdf: string
  restrict_part_switching: string
  test_solutions_pdf2: string
  test_questions_url: string
  test_questions_url_2: string
  remaining_attempt: string
  exam_theme: string
  language: string,
  enable_random_test_generator:any,
  terms_url?:any
  positive_marks?: string
  negative_marks?: string
  type?: any
  option_count?:any
  solution_url?:any
  solution_pdf?:any
  solution_pdf2?:any
  remainingtime?:any
  enable_negative_marks_for_fifth_option?:any
  all_question_compulsary?:any

}

export interface CoachingInstitute {
  id: string
  name: string
  logo: string
  test_series_id: string
  tests: TestTitle[]
  repositry_url:string
  folder_name:string
  sectionMap:{[key:string]:string}
}



export interface SectionMap {
  [key: string]: string
}

export interface SavedQuestion {
  id: string
  userId: string
  questionId: string
  coachingId: string
  testId: string
  question: string
  option_1: string
  option_2: string
  option_3: string
  option_4: string
  answer: string
  section_id: string
  positive_marks: number
  negative_marks: number
  savedAt: any // Firebase Timestamp
  // New fields - backward compatible with defaults
  instituteName?: string
  subject?: string
  solution?: string
  sectionName?: string
  testName?: string
  solution_text?: string
}
