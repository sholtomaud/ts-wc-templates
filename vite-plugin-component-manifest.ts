import { PluginOption, normalizePath, ResolvedConfig } from 'vite';
import fs from 'fs';
import path from 'path';


export default function componentManifest(): PluginOption {
    let componentsDir: string;
    let isDev = false;
    let config: ResolvedConfig; // Add this

    const isProduction = process.env.NODE_ENV === 'production';
    return {
        name: 'vite-plugin-component-manifest',
        configResolved(resolvedConfig) {
            config = resolvedConfig; // Store the config
            componentsDir = normalizePath(path.resolve(config.root, 'src/components'));
            isDev = config.command === 'serve';
        },
        configureServer(server) {
            const generateManifest = () => {
                const components = fs.readdirSync(componentsDir)
                    .filter(name => {
                        const stats = fs.statSync(path.join(componentsDir, name));
                        return stats.isDirectory();
                    });

                // Development: Use direct TS imports
                const imports = components.map(name => {
                    const importPath = isProduction
                        ? `"/assets/${name}.js"` // Production path
                        : `"./components/${name}/${name}.ts"`;  // Development path

                    return `"${name}": () => import(${importPath})`;
                }).join(',\n');

                const content = `// Auto-generated file - DO NOT EDIT
export const COMPONENT_PATHS = {
  ${imports}
};
`;

                fs.writeFileSync(
                    path.resolve(componentsDir, '../components.ts'),
                    content
                );
            };

            generateManifest();
            fs.watch(componentsDir, { recursive: true }, generateManifest);
        },
        buildStart() {
            if (!isDev) {
                const generateManifest = () => {
                    const components = fs.readdirSync(componentsDir)
                        .filter(name => {
                            const stats = fs.statSync(path.join(componentsDir, name));
                            return stats.isDirectory();
                        });

                    // Production: Use plain asset paths (no base prefix)
                    const imports = components.map(name =>
                        `'${name}': () => import('./components/${name}/${name}.ts')`
                    ).join(',\n');

                    const content = `// Auto-generated during build
                export const COMPONENT_PATHS = {
                    ${imports}
            }; \n`;

                    fs.writeFileSync(
                        path.resolve(componentsDir, '../components.ts'),
                        content
                    );
                };
                generateManifest();
            }
        }
    };
}

// export default function componentManifest(): PluginOption {
//     let componentsDir: string;
//     let isDev = false;

//     return {
//         name: 'vite-plugin-component-manifest',
//         configResolved(config) {
//             componentsDir = normalizePath(path.resolve(config.root, 'src/components'));
//             isDev = config.command === 'serve';
//         },
//         configureServer(server) {
//             const generateManifest = () => {
//                 const components = fs.readdirSync(componentsDir)
//                     .filter(name => {
//                         const stats = fs.statSync(path.join(componentsDir, name));
//                         return stats.isDirectory();
//                     });

//                 const imports = components.map(name => {
//                     return `'${name}': () => import(import.meta.env.MODE === 'development' ? './components/${name}/${name}.ts' : '/assets/${name}.js')`;
//                 }).join(',\n');

//                 const content = `// Auto-generated by vite-plugin-component-manifest
// export const COMPONENT_PATHS = {
// ${imports}
// };\n`;

//                 fs.writeFileSync(
//                     path.resolve(componentsDir, '../components.ts'),
//                     content
//                 );
//             };

//             // Generate on startup and watch for changes
//             generateManifest();
//             fs.watch(componentsDir, { recursive: true }, generateManifest);
//         },
//         buildStart() {
//             // Add watch only in development
//             if (isDev) {
//                 this.addWatchFile(componentsDir);
//             }

//             // Production-specific manifest generation
//             if (!isDev) {
//                 const generateManifest = () => {
//                     try {
//                         const components = fs.readdirSync(componentsDir)
//                             .filter(name => {
//                                 const stats = fs.statSync(path.join(componentsDir, name));
//                                 return stats.isDirectory();
//                             });

//                         const imports = components.map(name => {
//                             const tagName = name;
//                             return `  '${tagName}': () => import('/assets/${tagName}.js')`;
//                         }).join(',\n');

//                         const content = `// Auto-generated during build
//         export const COMPONENT_PATHS = {
//         ${imports}
//         };\n`;

//                         fs.writeFileSync(
//                             path.resolve(componentsDir, '../components.ts'),
//                             content
//                         );
//                     } catch (error) {
//                         this.error(`Failed to generate component manifest: ${error}`);
//                     }
//                 };

//                 // Generate manifest once at build start
//                 generateManifest();
//             }
//         }
//     }
// }