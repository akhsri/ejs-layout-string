import ejs from 'ejs';

const contentPattern = '&&<>&&';

function contentFor(contentName: string) {
  return contentPattern + contentName + contentPattern;
}

function parseContents(locals: any) {
  let name: string, i = 1, str = locals.body;
  const regex = new RegExp('\n?' + contentPattern + '.+?' + contentPattern + '\n?', 'g');
  const split = str.split(regex);
  const matches = str.match(regex);

  locals.body = split[0];

  if (matches !== null) {
    matches.forEach(function (match: any) {
      name = match.split(contentPattern)[1];
      locals[name] = split[i];
      i++;
    });
  }
}

function parseScripts(locals: any) {
  const str = locals.body;
  const regex = /\<script[\s\S]*?\>[\s\S]*?\<\/script\>/g;

  if (regex.test(str)) {
    locals.body = str.replace(regex, '');
    locals.script = str.match(regex)?.join('\n') || '';
  }
}


function parseStyles(locals: any) {
  const str = locals.body;
  const regex = /(?:\<style[\s\S]*?\>[\s\S]*?\<\/style\>)|(?:\<link[\s\S]*?\>(?:\<\/link\>)?)/g;

  if (regex.test(str)) {
    locals.body = str.replace(regex, '');
    locals.style = str.match(regex)?.join('\n') || '';
  }
}

function parseMetas(locals: any) {
  const str = locals.body;
  const regex = /\<meta(?!.*?(data-ignore|someIgnore))[\s\S]*?\/?>/g;

  if (regex.test(str)) {
    locals.body = str.replace(regex, '');
    locals.meta = str.match(regex)?.join('\n') || '';
  }
}

function renderFileAsync(view: string, options: object) {
  return new Promise<string>((resolve, reject) => {
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
    extractStyles: false,
    extractMetas: true,
  };

  options = options || {};
  const layout = options.layout || appSettings.layout;

  const mergedOptions = Object.assign({}, options, options._locals);

  try {
    // Render the main view
    const str = await renderFileAsync(view, mergedOptions);

    const locals = {
      defineContent: (contentName: string) => locals[contentName] || '',
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

    // Parse and extract elements
    if (options.extractScripts || appSettings.extractScripts) {
      parseScripts(locals); // Removes scripts and stores them in locals.script
    }

    if (options.extractStyles || appSettings.extractStyles) {
      parseStyles(locals);
    }

    if (options.extractMetas || appSettings.extractMetas) {
      parseMetas(locals);
    }

    parseContents(locals);

    // Render the layout with parsed locals
    const layoutStr = await renderFileAsync(options.layoutsPath, locals);

    return layoutStr;
  } catch (err) {
    throw err;
  }
}

