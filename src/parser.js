export default (rss, url) => {
  const parser = new DOMParser();
  const data = parser.parseFromString(rss, 'text/xml');
  const parseError = data.querySelector("parsererror");
  if (parseError) {
    const error = new Error(parseError.textContent);
    error.isParsingError = true;
    throw error;
  }

  const feedTitle = data.querySelector('title').textContent;
  const feedDescripton = data.querySelector('description').textContent;
  const feed = {
    url: url,
    title: feedTitle,
    description: feedDescripton,
  };
  const posts = [...data.querySelectorAll('item')].map((el) => {
    const link = el.querySelector('link').textContent;
    const title = el.querySelector('title').textContent;
    const description = el.querySelector('description').textContent;
    const date = el.querySelector('pubDate').textContent;
    return {
      link,
      title,
      description,
      date,
    };
  });
return { feed, posts };
};
