import { APP_DOMAIN, APP_NAME } from "@/config/app";

export const INSTALL_PATH = "/instalar";

export const installCopy = {
  reminder: {
    title: "Coloque o app na tela inicial",
    description: `Com o ${APP_NAME} na tela do celular, as suas obras abrem num toque, como um aplicativo, e lançar um gasto fica mais rápido.`,
    install: "Instalar agora",
    howTo: "Ver como fazer",
    later: "Agora não",
    never: "Não mostrar mais",
  },
  page: {
    metaTitle: "Instalar no celular",
    title: "Instalar no celular",
    intro: `O ${APP_NAME} funciona no navegador, mas fica melhor na tela inicial do celular: abre num toque, em tela cheia, direto nas suas obras. Não ocupa quase nada de espaço e não precisa da loja de aplicativos.`,
    installed: `Pronto: você já está usando o ${APP_NAME} instalado.`,
    installNow: "Instalar agora",
    installNowHint:
      "Este celular deixa instalar direto. Toque no botão e confirme.",
    jump: "Ir para:",
    back: "Voltar para o app",
    iphone: {
      id: "iphone",
      title: "iPhone",
      steps: [
        `Abra ${APP_DOMAIN} no Safari.`,
        "Toque no botão Compartilhar (o quadrado com uma seta para cima). Nos iPhones mais novos, ele fica no menu dos três pontinhos (…), ao lado do endereço.",
        "Role a lista e toque em “Adicionar à Tela de Início”.",
        "Toque em “Adicionar”, no canto de cima. O ícone aparece junto dos outros apps.",
      ],
      tip: "No Chrome do iPhone também dá: toque no botão Compartilhar ao lado do endereço e siga do passo 3.",
    },
    android: {
      id: "android",
      title: "Android",
      steps: [
        `Abra ${APP_DOMAIN} no Chrome.`,
        "Toque nos três pontinhos (⋮), no canto de cima.",
        "Toque em “Instalar app” ou “Adicionar à tela inicial” (o nome muda de celular para celular).",
        "Confirme em “Instalar”. O ícone aparece junto dos outros apps.",
      ],
      tip: "No navegador da Samsung: toque no menu (☰), depois em “Adicionar página a” e em “Tela inicial”.",
    },
    inAppBrowser: {
      title: "Abriu o link dentro do WhatsApp ou do Instagram?",
      text: "Por ali não dá para instalar. Toque nos três pontinhos e escolha “Abrir no navegador” (ou “Abrir no Safari”/“Abrir no Chrome”) e siga os passos.",
    },
  },
  settingsRow: {
    title: "Instalar no celular",
    description: "Como colocar o app na tela inicial.",
  },
} as const;
