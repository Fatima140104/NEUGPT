export const imageExtRegex = /\.(jpg|jpeg|png|gif|webp|heic|heif)$/i;

export const excelMimeTypes =
  /^application\/(vnd\.ms-excel|msexcel|x-msexcel|x-ms-excel|x-excel|x-dos_ms_excel|xls|x-xls|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet)$/;

export const textMimeTypes =
  /^(text\/(x-c|x-csharp|tab-separated-values|x-c\+\+|x-h|x-java|html|markdown|x-php|x-python|x-script\.python|x-ruby|x-tex|plain|css|vtt|javascript|csv))$/;

export const applicationMimeTypes =
  /^(application\/(epub\+zip|csv|json|pdf|x-tar|typescript|vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|presentationml\.presentation|spreadsheetml\.sheet)|xml|zip))$/;

export const imageMimeTypes = /^image\/(jpeg|gif|png|webp|heic|heif)$/;

export const supportedMimeTypes = [
  textMimeTypes,
  excelMimeTypes,
  applicationMimeTypes,
  imageMimeTypes,
  /^image\/(svg|svg\+xml)$/,
];

export const fileConfig = {
  endpoints: {
    default: {
      fileLimit: 10,
      fileSizeLimit: 10 * 1024 * 1024,
      totalSizeLimit: 100 * 1024 * 1024,
      supportedMimeTypes,
      disabled: false,
    },
  },
  serverFileSizeLimit: 20 * 1024 * 1024,
  avatarSizeLimit: 2 * 1024 * 1024,
  clientImageResize: {
    enabled: false,
    maxWidth: 1900,
    maxHeight: 1900,
    quality: 0.92,
  },
  checkType: function (
    fileType: string,
    supportedTypes: RegExp[] = supportedMimeTypes
  ) {
    return supportedTypes.some((regex) => regex.test(fileType));
  },
};
