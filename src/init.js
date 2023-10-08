  import * as yup from 'yup';
  import onChange from 'on-change';
  import watcher from './view.js'
  import i18next from 'i18next';
  import ru from './locales/ru.js';
  //import render from './view.js';
  const formFilling = () => {
  const feedback = document.querySelector('.feedback');
  const input = document.querySelector('#url-input');
  const button =  document.querySelector('button[type="submit"]');
  feedback.classList.remove('text-danger');
  feedback.classList.remove('text-success');
  input.classList.remove('is-invalid');
  feedback.textContent = '';
};
const formFail = () => {
  const feedback = document.querySelector('.feedback');
  const input = document.querySelector('#url-input');
  const button =  document.querySelector('button[type="submit"]');
  button.disabled = false
  input.disabled = false;
  input.focus();
  feedback.classList.add('text-danger');
  input.classList.add('is-invalid');
}
const formSuccess= () => {
  const feedback = document.querySelector('.feedback');
  const input = document.querySelector('#url-input');
  const button =  document.querySelector('button[type="submit"]');
  button.disabled = false
  input.disabled = false;
  input.focus();
  input.value = '';
  feedback.classList.remove('text-danger');
  feedback.classList.add('text-success');
  input.classList.remove('is-invalid');
}

const validate = (url, links) => {
  const schema = yup
    .string()
    .trim()
    .required()
    .url()
    .notOneOf(links);
  return schema.validate(url);
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
        };
        yup.setLocale({
        mixed: { notOneOf: 'existingFeed' },
        string: { url: 'invalidLink', required: 'emptyForm' },
      });
        const render =(path, value, i18nT) => {
 
	switch (value) {
	case 'filling':
    formFilling();
    break
	case 'failed':
	formFail();
	break;
	case 'success':
	formSuccess();
	break;

default:
	break
	}
}
  const watchedState = onChange(state, (path, value)=> {render(path,value,i18nT)})

  const form = document.querySelector('.rss-form');

  form.addEventListener('input', (e) => {
  	e.preventDefault()
        watchedState.form.state = 'filling';
        watchedState.form.error = null;
   });
  form.addEventListener('submit', (e)=> {
  	
  	e.preventDefault()
  	const formData = new FormData(form);
  	const url = formData.get('url');
  	validate(url, watchedState.data.feeds)
  	.then((link)=> {
  		console.log(i18nT(`success`))
  		watchedState.form.process = 'success'
  	})
  	.catch((er) => {
  		console.log(i18nT(`errors.${er.message}`))
  		watchedState.form.error = er.message;
  		watchedState.form.process = 'failed'
  	})

  })
    });
  
 


};

 
export default init;