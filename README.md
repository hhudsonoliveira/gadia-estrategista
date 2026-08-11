# Próximo Nível — Gádia Rodrigues

Site estático (HTML/CSS/JS puro) que substitui a instalação WordPress/Elementor
em `proximonivel-empreendedores.com`. Sem CMS, sem build step, sem dependências.

## Estrutura

```
index.html          Página inicial (todas as secções)
sobre.html          Sobre nós — Gádia Rodrigues, princípios, equipa
servicos.html       Serviços — benefícios, como funciona, para quem é, FAQ
eventos.html        Eventos — próximos, edições realizadas, depoimentos
blog.html           Revista Próximo Nível — todas as edições
css/style.css       Design system completo (tokens + componentes)
js/main.js          Scroll reveal, parallax, contadores, carrossel, vídeo
assets/images/      Imagens optimizadas em WebP
assets/favicon.svg  Marca
```

## Deploy no GitHub Pages

```bash
git init
git add .
git commit -m "Novo site Próximo Nível"
git branch -M main
git remote add origin git@github.com:UTILIZADOR/REPO.git
git push -u origin main
```

Depois, em **Settings → Pages**, escolher branch `main` / pasta `/ (root)`.
O ficheiro `.nojekyll` já está incluído para o Jekyll não interferir.

Para desenvolvimento local basta abrir `index.html` no browser, ou:

```bash
python -m http.server 8000
```

## Design system

Todas as cores, tipos, espaçamentos e curvas de animação são custom properties
no topo de `css/style.css`.

| Token | Valor | Uso |
|---|---|---|
| `--vinho-700` | `#3A1421` | Cor base da marca |
| `--champagne-500` | `#E8C4A0` | Destaque |
| `--font-display` | Fraunces | Títulos |
| `--font-body` | Inter | Texto |
| `--ease` | `cubic-bezier(.4,0,.2,1)` | Curva assinatura |
| `--dur-base` | `420ms` | Duração padrão |

Personalidade de movimento: **Premium** — sem overshoot, transições longas e
controladas. Tudo o que anima usa apenas `transform` e `opacity`.

`prefers-reduced-motion` está totalmente suportado: revelações, parallax,
contadores e o carrossel infinito desligam-se.

## Performance

- Imagens em WebP, `loading="lazy"` e `width`/`height` em todas (sem CLS)
- O vídeo não é incorporado: o canal tem a incorporação desactivada, por isso
  um `<iframe>` mostrava sempre "Assista no YouTube" sem reproduzir. Em vez
  disso há um cartão com a miniatura que abre o vídeo no YouTube — zero
  JavaScript e nenhum pedido ao player
- Ícones num sprite SVG inline — zero pedidos extra
- Sem frameworks, sem jQuery, sem bibliotecas de animação

## Por rever

- **Idade da Gádia** — o site antigo dizia "48 anos", texto de cerca de 2023.
  A copy foi reescrita para não depender da idade, e a estatística passou a
  "14 — a idade com que começou a empreender", que não envelhece. Confirmar
  na mesma se há números actualizados a usar.
- **Dois números de telefone** — `+351 962 609 146` (WhatsApp, secção de
  contacto e JSON-LD) e `+351 925 174 705` (rodapé). Ambos vêm do site
  original. Confirmar se os dois estão certos.
- **Revista Edição Brasil** — `/revista-brasil/` devolve 404 no site actual;
  o cartão encaminha para WhatsApp até haver URL válido.
- **IN Negócios Europa** — falta o local ("Local a anunciar") e arte própria.
- **Galeria de empreendedores** — os retratos não têm nome nem depoimento
  associado; editar `.portrait__label` quando houver essa informação.
- **Links das revistas** — apontam para o domínio WordPress actual. Actualizar
  quando as edições migrarem.
