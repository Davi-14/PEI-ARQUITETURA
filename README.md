# TempGuard

Sistema de monitoramento de ambiente em tempo real, com dashboard web integrado ao Firebase Realtime Database.

## Sobre o projeto

O TempGuard recebe dados de sensores conectados a um ESP32 (temperatura, entre outras leituras 
de ambiente) e os envia para o Firebase Realtime Database. O foco principal do desenvolvimento 
foi a camada de software: a integração com o Firebase e a construção de um dashboard web que 
exibe as leituras coletadas em tempo real.

## Funcionalidades

- Recepção de dados de sensores via ESP32
- Armazenamento e sincronização em tempo real com Firebase Realtime Database
- Dashboard web para visualização das leituras coletadas

## Tecnologias utilizadas

- **Frontend:** HTML, CSS, JavaScript
- **Backend/Infra:** Firebase Realtime Database, Firebase Hosting
- **Hardware:** ESP32 + sensores (protótipo)

## Como rodar

1. Clone o repositório
2. Configure suas credenciais do Firebase em `.firebaserc` / `firebase.json`
3. Rode `firebase serve` (ou publique com `firebase deploy`) para visualizar o dashboard

## Status

Protótipo funcional — dados reais foram enviados pelo ESP32 durante os testes. O 
desenvolvimento priorizou a integração com Firebase e a experiência do dashboard; a parte 
física (sensores/hardware) está em estágio inicial e pode ser expandida futuramente.

## Autor

Davi Araújo — [Linkedin](#) | [Github](#)
