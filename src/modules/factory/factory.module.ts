import { Module } from '@nitrostack/core';
import { FactoryTools } from './factory.tools.js';
import { FactoryResources } from './factory.resources.js';
import { FactoryPrompts } from './factory.prompts.js';


@Module({
  name: 'factory',
  description: 'FactoryMind AI Assistant',
  controllers: [
    FactoryTools,
    FactoryResources,
    FactoryPrompts
  ]
})
export class FactoryModule {}