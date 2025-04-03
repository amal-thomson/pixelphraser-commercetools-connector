/// <reference types="@commercetools-frontend/application-config/client" />

// import ReactDOM from 'react-dom';
// import EntryPoint from './components/entryPoint';

// ReactDOM.render(<EntryPoint />, document.getElementById('app'));


import ReactDOM from 'react-dom';
import EntryPoint from './components/entryPoint';
import { SelectedLanguagesProvider } from '../src/providers/SelectedLanguagesProvider';

ReactDOM.render(
  <SelectedLanguagesProvider>
    <EntryPoint />
  </SelectedLanguagesProvider>,
  document.getElementById('app')
);
