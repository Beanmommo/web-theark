import { db } from '../../utils/firebase'
import type { Page } from '~/types/data'

export default defineEventHandler(async event =>
{
  const url = getRouterParam(event, 'url')
  if (!url) return {}
  const ref = db.ref('pages');
  const page = new Promise<Page>((resolve, _) =>
    ref.orderByChild("url").equalTo(url).once('value', (snapshot) =>
    {
      const page = snapshot.val()
      Object.entries(page)[0][1]
      resolve(Object.entries(page)[0][1] as Page)
    }, (errorObject) =>
    {
      console.log('The read failed: ' + errorObject.name);
      resolve({} as Page)
    })
  )
  return page
})

