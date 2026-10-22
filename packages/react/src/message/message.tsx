import {mergeProps} from '@base-ui/react/merge-props';
import {useRender} from '@base-ui/react/use-render';
import {DraftIcon} from '@earendil-works/elanor-icons-react';
import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';

import {ImageGrid, type ImageGridProps} from '../image-grid/image-grid.tsx';
import {classes} from '../utils/class-names.ts';

import styles from './message.module.css';

/** One of the six participant colors, `semantic.color.background.fill.participant.1` to `.6`. */
export type MessageParticipant = 1 | 2 | 3 | 4 | 5 | 6;

export interface MessageRootProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
  /** The side the message sits on: `end` for the reader's own messages, `start` for everyone else's. */
  readonly align?: 'start' | 'end' | undefined;
  /** Tints the bubble and colors the speaker's name with a participant color, to tell people apart. */
  readonly participant?: MessageParticipant | undefined;
}

/**
 * A message in a conversation: its bubble, and a note below it. The reader's own messages sit at the end of the line,
 * everyone else's at the start, each at most 85% of the line wide.
 */
export function MessageRoot({
  ref,
  align = 'start',
  participant,
  className,
  ...props
}: MessageRootProps) {
  return (
    <div
      {...props}
      ref={ref}
      className={classes(styles.root, className)}
      data-align={align}
      data-participant={participant}
    />
  );
}

/** Lets a bubble frame its images more closely than its text. */
const BubbleContext = /* @__PURE__ */ createContext<((images: boolean) => void) | undefined>(
  undefined,
);

export interface MessageBubbleProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

/**
 * The message's bubble: its speaker, a quote of what it answers, images, text and files, in that order. With images,
 * it takes their width and a narrower frame; text keeps its inset.
 */
export function MessageBubble({ref, className, children, ...props}: MessageBubbleProps) {
  const [images, setImages] = useState(false);
  return (
    <BubbleContext.Provider value={setImages}>
      <div
        {...props}
        ref={ref}
        className={classes(styles.bubble, className)}
        data-images={images ? '' : undefined}
      >
        {children}
      </div>
    </BubbleContext.Provider>
  );
}

export interface MessageSpeakerProps extends useRender.ComponentProps<'div'> {}

/**
 * Who wrote the message, at the top of the bubble: a name, after an icon such as an agent's mark. Render a button
 * (`render={<button type="button" />}`) when the name opens something, such as the speaker's profile.
 */
export function MessageSpeaker({ref, render, ...props}: MessageSpeakerProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({className: styles.speaker}, props),
  });
}

export interface MessageQuoteProps extends Omit<
  useRender.ComponentProps<'button'>,
  'children' | 'name'
> {
  /** Who wrote the quoted message. */
  readonly author: ReactNode;
  /** What came with it, after the excerpt, such as "+ 2 messages". */
  readonly detail?: ReactNode;
  /** An excerpt of the quoted message, cut to one line. */
  readonly children?: ReactNode;
}

/**
 * What a message answers, in one line: who wrote it and an excerpt, beside a bar. A button by default, to show the
 * quoted message; it also stands on its own, such as above a reply that is not a bubble.
 */
export function MessageQuote({ref, render, author, detail, children, ...props}: MessageQuoteProps) {
  return useRender({
    defaultTagName: 'button',
    render,
    ref,
    props: mergeProps<'button'>(
      {
        className: styles.quote,
        type: render ? undefined : 'button',
        children: (
          <>
            {/* Spaces between the parts read as words to assistive technology; the flex layout drops them. */}
            <span className={styles.quoteName}>{author}</span>{' '}
            <span className={styles.quoteText}>{children}</span>
            {detail ? (
              <>
                {' '}
                <span className={styles.quoteDetail}>{detail}</span>
              </>
            ) : null}
          </>
        ),
      },
      props,
    ),
  });
}

export interface MessageTextProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
  /** Lines shown before the text is cut, fading out, with a button to show the rest. */
  readonly lines?: number | undefined;
  /** The button that shows a cut text in full. */
  readonly showMoreLabel?: string | undefined;
  /** The button that cuts it again. */
  readonly showLessLabel?: string | undefined;
}

/** The message's text: plain text or rich content. Longer than `lines`, it is cut with a button to show the rest. */
export function MessageText({
  ref,
  lines = 12,
  showMoreLabel = 'Show more',
  showLessLabel = 'Show less',
  className,
  style,
  children,
  ...props
}: MessageTextProps) {
  const own = useRef<HTMLDivElement>(null);
  const [long, setLong] = useState(false);
  const [expanded, setExpanded] = useState(false);
  // Measured again when the content changes.
  useLayoutEffect(() => {
    const element = own.current;
    if (element && !expanded) setLong(element.scrollHeight > element.clientHeight + 1);
  }, [children, expanded, lines]);
  const cut = !expanded;
  return (
    <>
      <div
        {...props}
        ref={(element) => {
          own.current = element;
          if (typeof ref === 'function') ref(element);
          else if (ref) ref.current = element;
        }}
        className={classes(styles.text, className)}
        data-overflows={cut && long ? '' : undefined}
        style={cut ? {...style, maxBlockSize: `${lines}lh`} : style}
      >
        {children}
      </div>
      {long && (
        <button
          type="button"
          className={styles.more}
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? showLessLabel : showMoreLabel}
        </button>
      )}
    </>
  );
}

export interface MessageImagesProps extends ImageGridProps {}

/** The message's images, as an image grid in the bubble's narrower frame. */
export function MessageImages({className, ...props}: MessageImagesProps) {
  const setImages = useContext(BubbleContext);
  useLayoutEffect(() => {
    setImages?.(true);
    return () => setImages?.(false);
  }, [setImages]);
  return <ImageGrid {...props} className={classes(styles.images, className)} />;
}

export interface MessageFilesProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

/** Files attached to the message, as a wrapping row of `Message.File` chips. */
export function MessageFiles({ref, className, ...props}: MessageFilesProps) {
  return <div {...props} ref={ref} className={classes(styles.files, className)} />;
}

export interface MessageFileProps extends HTMLAttributes<HTMLSpanElement> {
  readonly ref?: Ref<HTMLSpanElement> | undefined;
  /** The file's name or path, cut with an ellipsis when long. */
  readonly children?: ReactNode;
}

/** One attached file: a chip with a file icon and its name. */
export function MessageFile({ref, className, children, ...props}: MessageFileProps) {
  return (
    <span {...props} ref={ref} className={classes(styles.file, className)}>
      <DraftIcon />
      <span className={styles.fileName}>{children}</span>
    </span>
  );
}

export interface MessageNoteProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

/** A short note below the bubble, such as when it was edited or who has read it. */
export function MessageNote({ref, className, ...props}: MessageNoteProps) {
  return <div {...props} ref={ref} className={classes(styles.note, className)} />;
}
