import axios from 'axios'
export default defineEventHandler(async (event) =>
{
  const body = await readBody(event)
  const axiosData = {
    method: 'POST',
    headers: {
      Authorization: `Basic Ym9va2luZzpUaGVhcmtzZzEyMyE=`,
      'Content-Type': 'application/json',
    },
    data: body,
    url: 'https://thearkautomate.et.r.appspot.com/booking/',
  };
  await axios(axiosData);
  return { success: true }
})