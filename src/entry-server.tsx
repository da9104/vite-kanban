import { renderToString } from 'react-dom/server'
import { StaticRouter } from "react-router";
import App from './App'

export async function render(url: string) {
  try {
    const appHtml = renderToString(
      <StaticRouter location={url} >
        <App  />
      </StaticRouter>
    )

    return {
      html: appHtml,
      head: '',
    }
  } catch (error) {
    console.error('SSR render failed:', error)
    return {
      html: '<div>Error loading content</div>',
      head: '',
    }
  }
}