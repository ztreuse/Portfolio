// The Contact film's colour grade, applied on top of the frames' baked-in grade: lighter and less saturated, toward the
// crema of the light bands, which is also Contact's background. Skills' backdrop shows the film's first frame and must
// use the same grade, or the hand-off between them would show.
export const FILM_GRADE = 'saturate(0.6) brightness(1.08) contrast(0.96)';
