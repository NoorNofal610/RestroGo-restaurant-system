import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import structure from './structure'


export default defineConfig({
  name: 'default',
  title: 'sanity_project',

  projectId: 'vvwrlu0o',
  dataset: 'production',

  plugins: [structureTool({
// structure: structure as any,    
  }), visionTool()],

  schema: {
    types: schemaTypes,
  },

})
