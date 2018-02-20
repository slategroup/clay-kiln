import _ from 'lodash';
import { LIST_LOAD_PENDING, LIST_LOAD_SUCCESS, LIST_LOAD_FAIL } from './mutationTypes';
import { getList as getListFromAPI, getAuthor as getAuthorFromAPI, saveList } from '../core-data/api';

export function getList(store, listName) {
  const prefix = _.get(store, 'state.site.prefix');

  store.commit(LIST_LOAD_PENDING, { listName });
  return getListFromAPI(prefix, listName)
    .then((listItems) => store.commit(LIST_LOAD_SUCCESS, { listName, listItems }))
    .catch((error) => store.commit(LIST_LOAD_FAIL, { listName, error }));
}

export function getAuthor(store, uri) {
  const prefix = _.get(store, 'state.site.prefix');

  return getAuthorFromAPI(prefix, uri)
    .then((data) => {
      console.log('hello data is ', data)
      store.dispatch('saveComponent', { uri, data })
    })
    .catch((error) => {
      console.error('bahhhhhh ', error)
    });
}

export function updateList(store, { listName, fn }) {
  const prefix = _.get(store, 'state.site.prefix');

  store.commit(LIST_LOAD_PENDING, { listName });
  return getListFromAPI(prefix, listName)
    .then((listItems) => fn(_.cloneDeep(listItems)))
    .then((listItems) => saveList(prefix, listName, listItems))
    .then((listItems) => store.commit(LIST_LOAD_SUCCESS, { listName, listItems }))
    .catch((error) => store.commit(LIST_LOAD_FAIL, { listName, error }));
}
