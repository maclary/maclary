/** Load a module using the import function. */
// TSC replaces all īmports with require calls,
// so we must insert the mjsImport using a script after using TSC.
// export declare const mjsImport: (path: string | URL) => Promise<any>;
export const mjsImport = async (path: string) => import(path);
