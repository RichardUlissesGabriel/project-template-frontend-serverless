# Project Template Frontend Serverless

Esse projeto tem como objetivo servir como base para a criação de outros projetos.

São fornecidos ferramentas para tornar isso possível, e também para implementar regras de padronizações com o objetivo de melhorar a qualidade do desenvolvimento.

Foram abordados as soluções mais simples, e/ou com automatização para agilizar o processo de utilização.

## Instalação e Configuração
Ao clonar esse projeto se atente a sempre utilizar um ***Alias***
```
git clone https://github.com/RichardUlissesGabriel/project-template-frontend-serverless.git ***{Alias}***
```
Esse ***alias*** define qual novo projeto esta se iniciando.

| Exemplo |
|:----------------|
| api-serverless |
| etc... |

Com o projeto clonado a primeira coisa a se fazer é rodar o comando:
```
npm run init-project
```
Esse script situado no caminho ***./scripts/init-project.sh***, tem como objetivo criar o novo repositório dentro do [github](https://github.com/).

Após isso ele prepara o primeiro ***commit*** do projeto com o conteúdo completo desse repositório aqui.
Se atentar que ele utiliza o ***Alias*** escolhido como nome do novo repositório.

Se atentar também que é necessário a criação de um arquivo .env dentro da pasta scripts ***scripts/.env*** com os seguintes valores

| Key             | Descrição                                                             |
|:----------------|:----------------------------------------------------------------------|
| USER_GITHUB     | Usuário github onde será criado o repositório                         |
| API_GITHUB_KEY  | Chave com acesso aos repositórios para a utilização da API gdo github |
| PRIVATE         | Chave que define se o repositório será privado ou publico             |

---
Na sequencia o próprio ***init-project*** executa o script:
```
npm run update-git-version
```
Para o funcionamento de todas as funcionalidades desse projeto precisamos que a versão do ***git*** seja pelo menos a **2.13.0**.

#### Observação:
Caso não seja realizado a atualização da versão do git, ***não*** será possível realizar a instalação da ***dependências*** dos pacotes (via ***npm***) do projeto.

---
## Funcionalidade e Utilização

Esse projeto possui as seguintes ***funcionalidades***:

- [Editor config](#editorconfig)
- [Git hooks](#githooks)
- [Eslint](#eslint)
- [Commit lint](#commitlint)
- [Commitzen](#commitzen)
- [Changelog](#changelog)
- [Scripts](#scripts)

---
### <a name="editorconfig"></a>Editor config

Essa configuração tem o objetivo de padronizar alguns aspectos do projeto como:
- Formato dos espaçamentos TAB;
- Caractere delimitador de final de linha;
- Codificação dos arquivos;
- A adição de uma linha ao final do arquivo;
- A remoção dos espaços à direita de todas as  linhas (*trim*).

A configuração se encontra no arquivo ***.editorconfig***.

---
### <a name="githooks"></a>Git hooks

Foram adicionados uma serie de hooks ao git para rodar uma serie de validações de forma automática, entre elas podemos citar:
- ***commit-msg***: Nesse momento são aplicados as regras de [***linting***](#commitlint) sobre a mensagem do ***commit***

- ***prepare-commit-msg***: Nesse momento é chamado o aplicativo [***commitizen***](#commitzen) para auxiliar na confecção da mensagem de ***commit***

- ***pre-commit***:  Nesse momento são executados vários passos:
	-  Atualização de versão no ***package.json*** via [***script***](#scripts);
	- Geração automática do arquivo ***CHANGELOG.md***;
	- ***Linting*** dos arquivos via [***eslint***](#eslint);
	- Execução dos ***testes*** automatizados usando [***jest***](#jest).

- ***post-commit***: Nesse momento é gerado as tag com a nova versão caso seja necessário.
	- O ***path*** (0.0.***0***) sobe sempre que o ***commit*** é de ***bugfix***.
	- O ***Minor*** (0.***0***.0) sobe sempre que o ***commit*** é uma ***feature***.
	- O ***Major*** são alterações que quebram a versão anterior então deve ser alterado manualmente, quando necessário.

Caso o hooks ***falhem*** será necessário ***corrigir*** os ***problemas*** apontados para prosseguir com o ***commit***.

---
### <a name="eslint"></a>Eslint

O eslint é a configuração que adiciona a capacidade do editor apontar erros de padrões na codificação de arquivos ****.js***.

Em conjunto com os [git hooks](#githooks), se torna obrigatório a correção desses erros.

Com a utilização de [plugins](#plugins) nos editores é possível realizar o ***autofix*** de erros mais básicos.

As configurações se encontram nos arquivos ***.eslintrc.json*** e ***.eslintignore***.

Caso queira rodar o ***eslint*** para visualizar quais arquivos estão com erros somente é preciso rodar o comando:
```
npm run eslint
```

---
### <a name="commitlint"></a>Commit lint

Essa funcionalidade assim como o ***eslint*** tem o objetivo de apontar erros de padrões, só que as mensagens de ***commit***.

Ele trabalha junto com o [***commitzen***](#commitzen) que fornece uma interface em linha de comando para facilitar a criação da mensagens.

É necessário seguir o padrão descrito no post abaixo para todos escreverem as mensagens da melhor forma possível.
[https://github.com/HelenDias/commit-messages-guide/blob/master/README_pt-BR.md](https://github.com/HelenDias/commit-messages-guide/blob/master/README_pt-BR.md).

A configuração se encontra no arquivo ***commitlint.config.js***.

---
### <a name="commitzen"></a>Commitzen

Commitzen é um ***CLI*** para auxiliar a escrita das mensagens de ***commit***.

Para maiores informações acessar o [***link***](https://github.com/commitizen/cz-cli) da página no ***github*** dos criadores da funcionalidade.

Ele é chamado automaticamente dentro do [***git hooks***](#githooks).

---
### <a name="changelog"></a>Changelog

Essa Funcionalidade é simples, ela é responsável por gerar de forma automática o arquivo ***CHANGELOG.md***.

Esse arquivo lista todos os ***commits***, divididas pelas ***tags***, a geração é sempre gerada de maneira automática dentro do do [***git hooks***](#githooks).

Um ponto a se atentar é que o ultimo commit não vai para o arquivo no momento do hook pois o commit ainda não existe no repositório. Para resolver somente é necessário gerar o arquivo manualmente com o comando:
```
npm run change-log
```
---
### <a name="scripts"></a>Scripts

Aqui estão listado os scripts que foram desenvolvidos para auxiliar na automatização de alguns pontos de padronização que precisamos seguir.

#### Inicialização do projeto
Esse script deve ser o primeiro a ser executado, ele quem vai ficar responsável por criar o novo repositório, realizar as primeiras configurações desse repositório  e também vão fazer as verificações de versão ***git***

---
#### Atualização de versão do git
Esse script somente verifica qual a versão corrente do git dentro do sistema operacional.

Caso ela não esteja de acordo com a solicitada, é informado um pequeno passo-a-passo para a atualização da distribuição do ***Debian***.

Esse script também é rodado no momento da tentativa de execução da instalação das dependências ***npm install***, caso não esteja de acordo ele trava a instalação, só é possível trabalhar com esse projeto com uma versão mais atual do git.

---
#### Atualização de versão do projeto
Esse script é executado de forma automática no  [***git hooks***](#githooks). Ele é responsável por realizar a atualização da versão do projeto baseado no tipo do ***commit*** realizado, como explicado na própria seção de hooks.

Ele atua sobre a versão de dentro do ***package.json***, e também sobre a versão cadastrada como tag no git.

Para verificar as tags do projeto é preciso executar o comando:
```
git tag -l
```
---
## Editor recomendado

Como editor recomendado para rodar esse projeto é apontado o ***VSCode***

### <a name="plugins"></a>Plugins recomendados

- ***EditorConfig for VS Code***: Utilizado para criar o arquivo .editorconfig de forma automática.
- ***Eslint***: Esse plugin permite o vscode apontar os erros de lint
- ***GitLens***: Uma ferramenta poderosa para a visualização de coisas relacionadas ao ***git***, por exemplo qual commit e usuário alteraram a linha.
- Para esse plugin funcionar certifique-se que possui o ***git*** instalado na sua maquina ***windows***.
- ***Material Icon Theme***: Essa ferramenta é opcional, mas, para pessoas visuais ela ajuda, pois adiciona a imagem ao lado de cada arquivo de acordo com a extensão do mesmo.

---
## Ambientes
Atualmente são utilizados 4 ambientes ***dev***, ***test***, ***homolog*** e ***prod***.

Para **ambiente** temos as seguintes opções:

| Ambiente | Descrição                                                   |
|:-------- |:------------------------------------------------------------|
| dev      | Utilizado pelos dev no momento de testes de desenvolvimento |
| test     | Utilizado pelo QA para validação do desenvolvimento         |
| homolog  | Utilizado pelo Usuário para validação do desenvolvimento    |
| prod     | Utilizado e mantido para a utilização em produção           |

---
## Autores
* **Richard Ulisses Gabriel** - *Trabalho inicial*.
