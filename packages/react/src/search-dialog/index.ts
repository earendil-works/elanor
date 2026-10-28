import {Dialog as BaseDialog} from '@base-ui/react/dialog';

export {
  SearchDialogRoot as Root,
  SearchDialogTrigger as Trigger,
  SearchDialogPopup as Popup,
  SearchDialogForm as Form,
  SearchDialogInput as Input,
  SearchDialogClose as Close,
  SearchDialogResults as Results,
  SearchDialogStatus as Status,
  SearchDialogMessage as Message,
  SearchDialogList as List,
  SearchDialogResult as Result,
  SearchDialogResultContext as ResultContext,
  SearchDialogResultTitle as ResultTitle,
  SearchDialogResultExcerpt as ResultExcerpt,
  SearchDialogFooter as Footer,
  SearchDialogHint as Hint,
} from './search-dialog.tsx';

export const createHandle = BaseDialog.createHandle;

export {
  SearchDialogStaticRoot as StaticRoot,
  SearchDialogStaticTrigger as StaticTrigger,
  SearchDialogStaticPopup as StaticPopup,
  SearchDialogStaticInput as StaticInput,
  SearchDialogStaticClose as StaticClose,
  SearchDialogStaticResults as StaticResults,
  SearchDialogStaticStatus as StaticStatus,
  SearchDialogStaticMessage as StaticMessage,
  SearchDialogStaticQuery as StaticQuery,
  SearchDialogStaticList as StaticList,
} from './search-dialog-static.tsx';
