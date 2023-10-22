import _ from 'lodash';

const parse = (content) => {
  const domParser = new DOMParser();
  const parsedDOM = domParser.parseFromString(content, 'text/xml');
  const parsingError = parsedDOM.querySelector('parsererror');
  if (parsingError) throw new Error('parsingError');
  const channel = parsedDOM.querySelector('channel');
  const title = channel.querySelector('title').textContent;
  const description = channel.querySelector('description').textContent;
  const feed = { title, description };

  const items = parsedDOM.querySelectorAll('item');
  const itemsArray = Array.from(items);

  const posts = itemsArray.map((item) => {
    const postLink = item.querySelector('link').textContent;
    const postTitle = item.querySelector('title').textContent;
    const postDescription = item.querySelector('description').textContent;
    return {
      link: postLink,
      title, postDescription
    };
  });

  return { feed, posts };
};

export default parse;
