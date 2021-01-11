'use strict';

const prompts = require('prompts');
const fs = require('fs');
const utils = require('./utils');


module.exports = async (options) => {
    if (!options) {
        return;
    }
    utils.log('create config file');
    /**
     * Get default configuration to pre-fill option
    */
    const defaultFile = await fs.readFileSync('./node_modules/format-commit/lib/default.config.json');
    const defaultConfig = JSON.parse(defaultFile);
    /**
     * Get current git branch to pre-fill main branch option
    */
    const currentBranch = await utils.getCurrentBranch();

    let cancelled = false;
    const config = await prompts([
        {
            type: 'select',
            name: 'format',
            message: 'Commit format',
            choices: options.commitFormats,
        },
        {
            type: 'number',
            name: 'minLength',
            message: 'Commit minimum length?',
            validate: val => val < 1 ? `${val} isn't a valid length` : true,
            initial: defaultConfig.minLength.toString(),
        },
        {
            type: 'number',
            name: 'maxLength',
            message: 'Commit maximum length?',
            validate: val => val < 1 ? `${val} isn't a valid length` : true,
            initial: defaultConfig.maxLength.toString(),
        },
        {
            type: 'select',
            name: 'changeVersion',
            message: 'Change package version',
            choices: options.versionChangeMode,
        },
        {
            type: prev => prev === 'mainbranch' ? 'text' : null,
            name: 'mainBranch',
            message: 'Main git branch ?',
            initial: currentBranch,
        },
        {
            type: 'confirm',
            name: 'showAllVersionTypes',
            message: 'Display all npm version types?',
            initial: defaultConfig.showAllVersionTypes,
        },
        {
            type: 'confirm',
            name: 'commitAfter',
            message: 'Commit your changes now?',
            initial: true,
        },
    ], {
        onCancel: () => {
            cancelled = true;
            return false;
        },
    });
    /**
     * Handle prompt cancellation and stop setup execution
     */
    if (cancelled) {
        utils.log('setup cancelled');
        return;
    }
    /**
     * Parse prompt data and write config file
     */
    utils.log('write commit.config.json file...');
    const parsedConfig = JSON.stringify(config, null, 2);
    await fs.writeFileSync('./commit.config.json', parsedConfig);
    return {
        parsedConfig,
        commitAfter: config.commitAfter,
    };
};