#!/usr/bin/env node
'use strict';

const { program } = require('commander');
const fs = require('fs');
const utils = require('./utils');
const setup = require('./setup');
const commit = require('./commit');

program.option('-c, --config', 'generate a configuration file on your project for format-commit');
program.parse(process.argv);

(async () => {
    if (program.config) {
        await setup();
        return;
    }
    /**
     * Get config from consumer package root
     * Generate new config file if not founded
     */
    fs.readFile('./commit.config.json', async (err, data) => {
        /**
         * Get options for select questions
        */
        const optionsFile = await fs.readFileSync('./node_modules/format-commit/lib/options.json');
        const options = JSON.parse(optionsFile);
    
        if (err) {
            utils.log('no configuration found', 'warning');
            const config = await setup(options);
            if (config.commitAfter) {
                commit(options, config.parsedConfig);
            }
        } else {
            commit(options, JSON.parse(data));
        }
    });
})();