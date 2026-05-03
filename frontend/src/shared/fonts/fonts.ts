import localFont from 'next/font/local';

export const primaryFont = localFont({
  src: [
    {
      path: '../../../assets/fonts/primary/Inter_18pt-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../assets/fonts/primary/Inter_18pt-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../../assets/fonts/primary/Inter_18pt-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../../assets/fonts/primary/Inter_18pt-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-inter',
  display: 'swap',
});

export const academicFont = localFont({
  src: [
    {
      path: '../../../assets/fonts/academic/SourceSerif4-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../assets/fonts/academic/SourceSerif4-Italic.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../../assets/fonts/academic/SourceSerif4-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../../assets/fonts/academic/SourceSerif4-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-source-serif',
  display: 'swap',
  preload: false,
});

export const monoFont = localFont({
  src: [
    {
      path: '../../../assets/fonts/mono/JetBrainsMono-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../assets/fonts/mono/JetBrainsMono-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../../assets/fonts/mono/JetBrainsMono-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-jetbrains',
  display: 'swap',
  preload: false,
});
