
const mammoth = require("mammoth")
const argv = require('yargs/yargs')(process.argv.slice(2))
    .usage('Usage: $0 [file] [output]')
    .default('file', 'input.docx')
    .default('output', 'pipe') // Output can be pipe or json
    .argv;
const puppeteer = require('puppeteer')
const fs = require('fs/promises')

var mammothOptions = {
  styleMap: [
    "b => b",
    "i => i"
  ]
};

mammoth.convertToHtml({path: argv.file}, mammothOptions)
  .then(function(result){
      let htmlFromFile = result.value
      let messages = result.messages

      if (messages.length > 0) {
        throw new Error(JSON.stringify(messages))
      }

      callPuppeteer(htmlFromFile)
  })
  .catch(function(error) {
      console.error(error);
  });

function callPuppeteer(htmlFromFile) {
  (async () => {
      const browser = await puppeteer.launch({
          defaultViewport: {
              width: 1920,
              height: 1080,
          },
          bindAddress: '0.0.0.0',
          args: [
              '--no-sandbox',
              '--headless',
              // '--disable-gpu',
              // '--disable-dev-shm-usage',
              // '--remote-debugging-port=9222',
              // '--remote-debugging-address=0.0.0.0',
          ],
      });

      const page = await browser.newPage();

      const htmlContent = `<body>
      <div id="editorjs"></div>
      <div id="outout"></div>
      </body>`
      await page.setContent(htmlContent);
      await page.addScriptTag({path: './src/editorjs/editor.min.js'});
      await page.addScriptTag({path: './src/editorjs/paragraph.min.js'});
      await page.addScriptTag({path: './src/editorjs/list.min.js'});
      await page.addScriptTag({path: './src/editorjs/link.min.js'});
      await page.addScriptTag({path: './src/editorjs/header.min.js'});
      await page.addScriptTag({path: './src/editorjs/raw.min.js'});


      const scriptContent = `
        const editor = new EditorJS({
          holder: 'editorjs',
          tools: {
            paragraph: {
              class: Paragraph,
              inlineToolbar: true,
            },
            list: {
              class: List,
              inlineToolbar: true,
              config: {
                defaultStyle: 'unordered'
              }
            },
            header: Header,
            linkTool: {
              class: LinkTool,
            },
            raw: RawTool,
          },

          onReady: () => {
            editor.blocks.renderFromHTML('${htmlFromFile}')
          },

          onChange: () => {
            editor.save().then((outputData) => {
              document.getElementById('outout').innerHTML = JSON.stringify(outputData)
            })
          },
        })
        `
      await page.addScriptTag({content: scriptContent});

      // await page.waitForSelector('#complete');
      await page.waitForTimeout(2000);

      const output = await page.evaluate(() => {
          return document.getElementById('outout').innerHTML
      })

      await browser.close();

      if (argv.output === 'pipe') {
        console.log(output)
        return
      }

      // Get filename from argv and remove extension
      const filename = argv.file.split('.')[0]
      // Slugify the filename and add .json extension
      const slugifiedFilename = filename.replace(/\s+/g, '-').toLowerCase() + '.json'
      // Write the output to a file
      await fs.writeFile(`/usr/src/app/${slugifiedFilename}`, output)
  })();
}