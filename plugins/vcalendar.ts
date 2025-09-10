import { Calendar, DatePicker } from 'v-calendar';
import 'v-calendar/style.css';

export default defineNuxtPlugin(app =>
{
  app.vueApp.component('VCalendar', Calendar)
  app.vueApp.component('VDatePicker', DatePicker)
});