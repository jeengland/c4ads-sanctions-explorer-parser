# parser_test
A test of the parser for c4ads.

This parser takes CSV files and turns them into JSON objects, while also cleaning any null values from the data. It can easily run on an entire directory of CSV files at the same time.

## Installation
In order to get ready to use the parser, clone it to your local machine and run `npm install` in order to get all the dependencies in order.

## Usage
Once everything has been installed, you have two options for running the parser: 

* Load all the CSV files into a folder named "data" within the parser directory and run `npm run parser` in the command line. Make sure to __only__ load CSV files into the directory or it will break the parser as it exists right now. 

* `npm run parser` accepts a folder location (relative or exact) as an argument. Once again this __must__ be a folder with only CSV files or it will break the parser. 

Either way, the parser will output the files as JSON in the "json" folder within the parser directory. The files will have the same name as they started with, only the file type and extension will change.