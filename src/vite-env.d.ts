/// <reference types="vite/client" />

// This overrides the default Vite type for CSS files and treats them all as CSS Modules.
declare module '*.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key:string]: string };
  export default classes;
}
