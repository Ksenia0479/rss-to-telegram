import { Injectable, Logger } from '@nestjs/common';

import * as jsdom from 'jsdom';

import * as Interfaces from './article.interfaces';
import { UtilitiesService } from '../utilities.service';

@Injectable()
export class ArticleService {
  private readonly logger = new Logger(ArticleService.name);
  private readonly template = {
    article: [
      'ul',
      'ol',
      'blockquote',
      'h1',
      'h2',
      'h3',
      'p',
      'li',
      'section',
      'div',
    ],
    main: [
      'ul',
      'ol',
      'blockquote',
      'h1',
      'h2',
      'h3',
      'p',
      'li',
      'section',
      'div',
    ],
    ul: ['li'],
    ol: ['li'],
    blockquote: ['cite'],
    h1: ['h4', 'h5', 'h6'],
    h2: ['h4', 'h5', 'h6'],
    h3: ['h4', 'h5', 'h6'],
    p: ['a', 'strong', 'em', 'i', 'span', 'b', 'br'],
    li: ['h1', 'h2', 'h3', 'p', 'a', 'ul', 'ol', 'blockquote'],
    a: ['strong'],
    section: ['h1', 'h2', 'h3', 'p', 'a', 'ul', 'ol', 'blockquote', 'div'],
    div: [
      'h1',
      'h2',
      'h3',
      'p',
      'a',
      'ul',
      'ol',
      'blockquote',
      'div',
      'strong',
      'span',
    ],
  };
  private readonly contentSelectors: Interfaces.ContentSelector[] = [
    {
      tagName: 'article',
    },
    { tagName: 'main' },
  ];

  constructor(private readonly utilitiesService: UtilitiesService) {}

  async getArticleContent(url: string): Promise<Interfaces.ExtractedArticle> {
    this.logger.log(`Getting article content from url: ${url}`);
    const feedData = await this.utilitiesService.getFeedData(url);
    const article = this.extractArticle(feedData, url);
    const metaData = this.extractArticleMetadata(feedData);
    this.logger.log(`Successfully fetched article content from url: ${url}`);
    return { article, metaData };
  }

  private initializeJSDOM(feedData: string): Document {
    const { JSDOM } = jsdom;
    // https://github.com/jsdom/jsdom/issues/2230
    const virtualConsole = new jsdom.VirtualConsole();
    virtualConsole.on('error', () => {
      // 'No-op to skip console errors.'
    });
    const dom = new JSDOM(feedData, { virtualConsole });
    return dom.window.document;
  }

  private extractArticleMetadata(feedData: string): Record<string, string> {
    this.logger.log('Extracting article metadata');
    const document = this.initializeJSDOM(feedData);

    const metaData = {};
    const metaElements = document.querySelectorAll('meta');

    metaElements.forEach((meta) => {
      const name = meta.getAttribute('name') || meta.getAttribute('property');
      const content = meta.getAttribute('content');
      if (name && content) {
        metaData[name] = content;
      }
    });

    return metaData;
  }

  private extractArticle(
    feedData: string,
    url: string,
  ): Interfaces.ArticleContent {
    try {
      this.logger.log(`Extracting article content from url: ${url}`);
      const document = this.initializeJSDOM(feedData);
      const lang = document.documentElement.getAttribute('lang');
      const language = lang ? this.utilitiesService.getIso6391Name(lang) : '';
      const text = this.getArticleText(document, url);

      this.logger.log(
        `Successfully extracted article content from url: ${url}`,
      );
      return { text, language };
    } catch (error) {
      this.logger.error(
        `Failed to extract article content from url: ${url}: ${error}`,
      );
      throw error;
    }
  }

  private getArticleText(document: Document, url: string): string {
    this.logger.log(`Getting article text from url: ${url}`);
    const data = this.findArticles(document);

    if (!data.activeTagName) {
      this.logger.error(`No active template found for url: ${url}`);
      return null;
    }

    this.logger.log(`Active template found: ${data.activeTagName}`);

    // TODO - refactor articles[0]
    const text = this.extractText(data.articles[0], data.activeTagName);
    this.logger.log(`Extracted article text: ${text}`);

    return text;
  }

  private findArticles(document: Document): {
    articles: HTMLElement[];
    activeTagName: Interfaces.ContentSelector['tagName'];
  } {
    let activeTagName: Interfaces.ContentSelector['tagName'] = null;
    const articles = this.contentSelectors.reduce(
      (accumulatedElements: HTMLElement[], settings) => {
        const elements = Array.from(
          document.getElementsByTagName(settings.tagName),
        );
        if (elements.length > 0) {
          activeTagName = settings.tagName;
          return accumulatedElements.concat(elements);
        }
        return accumulatedElements;
      },
      [],
    );
    return { articles, activeTagName };
  }

  private extractText(
    element: Element,
    parentTagName: keyof HTMLElementTagNameMap,
  ): string {
    const textPieces: string[] = [];
    element.childNodes.forEach((child) => {
      if (child.hasChildNodes()) {
        const childElement = child as Element;
        const childTagName =
          childElement.tagName.toLowerCase() as keyof HTMLElementTagNameMap;

        if (this.template[parentTagName]?.includes(childTagName)) {
          const childText = this.extractText(childElement, childTagName);
          textPieces.push(childText);
        }
      } else if (child.nodeType === 3 && child.textContent) {
        const text = child.textContent.trim();
        textPieces.push(text);
      }
    });

    return textPieces.join(' ');
  }
}
