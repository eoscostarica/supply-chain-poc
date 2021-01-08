export const version = process.env.REACT_APP_VERSION
export const name = process.env.REACT_APP_NAME
export const title = process.env.REACT_APP_TITLE
export const logo = process.env.REACT_APP_LOGO
export const simpleAssetsAccount = process.env.REACT_APP_SIMPLE_ASSETS_ACCOUNT
export const blockExplorer = process.env.REACT_APP_BLOCK_EXPLORER || ''
export const footerLinks = JSON.parse(
  process.env.REACT_APP_FOOTER_LINKS || '[]'
)
