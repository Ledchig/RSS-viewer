export default (rss) => {
  const parser = new DOMParser();
  const data = parser.parseFromString(rss, 'application/xml');
  const parseError = data.querySelector('parsererror');
  if (parseError) {
    const error = new Error(parseError.textContent);
    error.isParsingError = true;
    throw error;
  }

  const feed = {
    title: data.querySelector('title').textContent,
    description: data.querySelector('description').textContent,
  };
  const posts = [...data.querySelectorAll('item')].map((el) => ({
    link: el.querySelector('link').textContent,
    title: el.querySelector('title').textContent,
    description: el.querySelector('description').textContent,
  }));
  return { feed, posts };
};
