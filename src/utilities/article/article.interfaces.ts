export interface ContentSelector {
  tagName: 'article' | 'main';
}

export interface ArticleContent {
  language: string;
  text: string;
}

export interface ExtractedArticle {
  article: ArticleContent;
  metaData: Record<string, string>;
}
