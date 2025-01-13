import ejs from 'ejs';

const contentPattern = '&&<>&&';

function contentFor(contentName: any) {
  return contentPattern + contentName + contentPattern;
}

function parseContents(locals: any) {
  let name, i = 1;
  const str = locals.body;
  const regex = new RegExp('\n?' + contentPattern + '.+?' + contentPattern + '\n?', 'g');
  const split = str.split(regex);
  const matches = str.match(regex);

  locals.body = split[0];

  if (matches !== null) {
    matches.forEach((match: any) => {
      name = match.split(contentPattern)[1];
      locals[name] = split[i];
      i++;
    });
  }
}

function parseElements(locals: any, regex: any, prop: string, shouldExtract: boolean) {
  const str = locals.body;

  if (shouldExtract && regex.test(str)) {
    locals.body = str.replace(regex, '');
    locals[prop] = str.match(regex)?.join('\n') || '';
  } else {
    locals[prop] = ''; // Ensure no leftover extracted content
  }
}

function parseScripts(locals: object, shouldExtract: boolean) {
  const scriptRegex = /<script[\s\S]*?>[\s\S]*?<\/script>/g;
  parseElements(locals, scriptRegex, 'script', shouldExtract);
}

function parseStyles(locals: object, shouldExtract: boolean) {
  const styleRegex = /(?:<style[\s\S]*?>[\s\S]*?<\/style>)|(?:<link[\s\S]*?>(?:<\/link>)?)/g;
  parseElements(locals, styleRegex, 'style', shouldExtract);
}

function parseMetas(locals: object, shouldExtract: boolean) {
  const metaRegex = /<meta(?!.*?(data-ignore|someIgnore))[\s\S]*?\/?>/g;
  parseElements(locals, metaRegex, 'meta', shouldExtract);
}

function renderFileAsync(view: string, options: any) {
  return new Promise((resolve, reject) => {
    ejs.renderFile(view, options, (err, str) => {
      if (err) {
        return reject(err);
      }
      resolve(str);
    });
  });
}

export async function renderWithLayout(view: string, options: any) {
  const appSettings = {
    layout: 'layout',
    extractScripts: true,
    extractStyles: true,
    extractMetas: true,
  };

  options = options || {};
  const layout = options.layout || appSettings.layout;

  const mergedOptions = Object.assign({}, options, options._locals);

  try {
    // Render the main view
    const str = await renderFileAsync(view, mergedOptions);

    const locals = {
      defineContent: (contentName: any) => locals[contentName] || '',
      contentFor: contentFor,
      ...mergedOptions,
      body: str,
    };

    Object.assign(locals, options);

    if (typeof locals.body !== 'string') {
      throw new Error('Invalid body content');
    }

    // Initialize script, style, and meta properties
    locals.script = '';
    locals.style = '';
    locals.meta = '';

    // Parse and extract elements based on options
    parseScripts(locals, options.extractScripts);
    parseStyles(locals, options.extractStyles);
    parseMetas(locals, options.extractMetas);

    parseContents(locals); // Parse content blocks like <%- contentFor('foo') %>

    // Render the layout with parsed locals
    const layoutStr = await renderFileAsync(options.layoutsPath, locals);

    return layoutStr;
  } catch (err) {
    console.error('Error in renderWithLayout: ', err);
    throw err;
  }
}
