// UI
const evcAscii = require('./Utils/ascii');
const chalk = require('chalk');
const readline = require('readline');

// File
const fs = require('fs');
const path = require('path');

// File Entrypoint
const exiftool = require('node-exiftool');
const exiftoolBin = require('dist-exiftool');
const ep = new exiftool.ExiftoolProcess(exiftoolBin);


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


function clearTerminal() {
    console.clear();
}


const Menu = () => {
    clearTerminal();
    console.log(chalk.greenBright(evcAscii));
    getFileName();
}


const getFileName = () => {

    console.log(chalk.yellowBright("[!] - The executable needs to be in the same folder"));

    const nonExistentExecutable = "[X] - The executable specified don't exist";

    rl.question("[?] - File name: ", (fileName) => {

        fs.existsSync(fileName) ? getEntryPoint(fileName)
                                : console.log(chalk.redBright(`\n${nonExistentExecutable}`)); setTimeout(Menu, 2000);
    })
}


const getEntryPoint = (fileName) => {

    console.log(chalk.greenBright("\n[!] - Executable found, let's verify."));

    const fileNamePath = path.join(`${__dirname}/${fileName}`);
    const readFile = fs.createReadStream(fileNamePath);

    ep.open()
        .then(() => ep.readMetadata(readFile, ['-File:all']))
        .then((fileResponse) => {

            const fileEntrypoint = fileResponse.data[0].EntryPoint;

            console.log('[#] - Executable entrypoint: ' + fileEntrypoint);
            verifyEntrypoint(fileEntrypoint);

        })
        .then(() => ep.close(), () => ep.close())
        .catch(console.error)
}


const verifyEntrypoint = (fileEntrypoint) => {

    const entryPointData = fs.readFileSync('data.txt', 'utf-8');
    const dataSplit = entryPointData.toString().split("\n").join("\t").split("\t").join("\r").split("\r");

    dataSplit.some(val => val === fileEntrypoint) ? console.log(chalk.redBright('\n[X] - Probably infected executable')) && rl.close()
                                                  : console.log(chalk.greenBright('\n[!] - Secure executable.'));

}

Menu();