import _ from 'lodash';
import axios from 'axios';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import ru from './locales/ru.js';
import parse from './parser.js';
import render from './view.js';

const fillElementsWithText = (elements, i18nT) => {
  const {
    header, lead, urlLabel, button, modal,
  } = elements;
  header.textContent = i18nT('header');
  lead.textContent = i18nT('lead');
  urlLabel.textContent = i18nT('urlLabel');
  button.textContent = i18nT('button');
  modal.primary.textContent = i18nT('modal.primary');
  modal.secondary.textContent = i18nT('modal.secondary');
};

const elements = {
  form: document.querySelector('.rss-form'),
  feedback: document.querySelector('.feedback'),
  input: document.querySelector('#url-input'),
  button: document.querySelector('button[type="submit"]'),
  feeds: document.querySelector('.feeds'),
  posts: document.querySelector('.posts'),
  header: document.querySelector('.header'),
  lead: document.querySelector('.lead'),
  urlLabel: document.querySelector('label[for="url-input"]'),
  modal: {
    container: document.querySelector('.modal'),
    title: document.querySelector('.modal-title'),
    body: document.querySelector('.modal-body'),
    primary: document.querySelector('.full-article'),
    secondary: document.querySelector('.close-modal'),
    footer: document.querySelector('.modal-footer'),
  },
};

const getAllOriginsURL = (url) => {
  const allOriginsGetURL = new URL('https://allorigins.hexlet.app/get');
  allOriginsGetURL.searchParams.set('disableCache', 'true');
  allOriginsGetURL.searchParams.set('url', url);
  return allOriginsGetURL;
};

const validate = (url, links) => {
  const schema = yup
    .string()
    .trim()
    .required()
    .url()
    .notOneOf(links);
  return schema.validate(url);
};

const addNewPosts = (state, posts) => {
  const newPostsWithId = posts.map((post) => ({ ...post, id: _.uniqueId() }));
  state.data.posts = [...newPostsWithId, ...state.data.posts];
};

const updateFeed = (state) => {
  const { feeds } = state.data;
  const oldPosts = state.data.posts;

  const promises = feeds.map((feed) => {
    const { link } = feed;
    const allOriginsURL = getAllOriginsURL(link);
    return axios.get(allOriginsURL).then((response) => {
      const responseContent = response.data.contents;
      const { posts } = parse(responseContent);
      const oldLinks = oldPosts.map((post) => post.link);
      const newPosts = posts.filter((post) => !oldLinks.includes(post.link));
      if (newPosts.length > 0) {
        addNewPosts(state, newPosts);
      }
    });
  });

  Promise.all(promises).finally(() => {
    setTimeout(() => updateFeed(state), 5000);
  });
};

const init = () => {
  const i18nInstance = i18next.createInstance();
  i18nInstance
    .init({
      lng: 'ru',
      debug: false,
      resources: {
        ru,
      },
    })
    .then((i18nT) => {
      const state = {
        form: {
          process: 'filling',
          error: null,
          input: '',
        },
        data: {
          feeds: [],
          posts: [],
        },
        uiState: {
          modalId: null,
          visitedIds: [],
        },
      };
      yup.setLocale({
        mixed: { notOneOf: 'existingFeed' },
        string: { url: 'invalidLink', required: 'emptyForm' },
      });

      fillElementsWithText(elements, i18nT);

      const watchedState = onChange(state, render(elements, state, i18nT));

      updateFeed(watchedState);

      elements.form.addEventListener('input', (e) => {
        e.preventDefault();
        watchedState.form.state = 'filling';
        watchedState.form.error = null;
      });

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(elements.form);
        const url = formData.get('url');
        const links = watchedState.data.feeds.map(({ link }) => link);
        validate(url, links)
          .then((link) => {
            watchedState.form.process = 'sending';
            const allOriginsURL = getAllOriginsURL(link);
            return axios.get(allOriginsURL, { timeout: 5000 });
          }).then((response) => {
            const responseContent = response.data.contents;
            const { feed, posts } = parse(responseContent);
            watchedState.data.feeds.push({ ...feed, id: _.uniqueId(), link: url });
            addNewPosts(watchedState, posts);
            watchedState.form.process = 'complete';
          }).catch((error) => {
            if ((error.message === 'Network Error') || error.message === ('timeout of 5000ms exceeded')) {
              watchedState.form.error = 'NetworkError';
            } else {
              watchedState.form.error = error.message;
            }
            watchedState.form.process = 'failed';
          });
      });

      elements.posts.addEventListener('click', (e) => {
        const { id } = e.target.dataset;
        if (id && !state.uiState.visitedIds.includes(id)) {
          watchedState.uiState.visitedIds.push(id);
        }
      });

      elements.modal.container.addEventListener('show.bs.modal', (e) => {
        const { id } = e.relatedTarget.dataset;
        if (!state.uiState.visitedIds.includes(id)) {
          watchedState.uiState.visitedIds.push(id);
        }
        watchedState.uiState.modalId = id;
      });
    });
};

export default init;
