# DOCX to EditorJS JSON converter

Using Puppeteer / Mammothjs / Editorjs

Install dependencies with:

```
npm ci
```


Build the image using:

```
docker build -t media24si/docx2json:latest .
```

Run using:
```
docker run -it -v /folder/with/docx/documents:/usr/src/app/input --rm media24si/docx2json:latest '--file=input/example.docx'
```

There is an optional `--output` parameter at the end that allows to set the output type. The default output just prints JSON to the command line, but you can set the `--output` to `json` to create a json file at the location of the current file.

```
docker run -it -v /folder/with/docx/documents:/usr/src/app/input --rm media24si/docx2json:latest '--file=input/example.docx' '--output=json'
```

This will generate a `example.json` file in the `/folder/with/docx/documents` folder that you supplied.