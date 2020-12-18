import Color from "color";
import Head from "next/head";
import Layout from "../layouts/index";
import { useState, useEffect } from "react";
import getNotionData from '../lib/notion'

export default function Page({ sections, etag, meta }) {
  const focused = useFocus();
  useEffect(
    () => {
      if (focused) {
        fetch(window.location, {
          headers: {
            pragma: "no-cache"
          }
        }).then(async res => {
          const text = await res.text()

          if (text.indexOf(etag) === -1) {
            window.location.reload();
          }
        }).catch(() => {});
      }
    },
    [focused]
  );

  const color = Color(meta.color ? meta.color[0][0] : "#49fcd4");
  const color2 = color.darken(0.4);
  const color3 = color2.lighten(0.1);

  return (
    <Layout>
      <Head>
        {meta.title && <title>{meta.title[0][0]}</title>}
        {meta.description && (
          <meta name="description" content={meta.description[0][0]} />
        )}
      </Head>

      {sections.map((section, i) => {
        return (
          <section
            key={`section-${i}`}
            className={i === 0 ? "intro" : ""}
            id={i === 1 ? "first" : ""}
          >
            <header>
              {i === 0 ? (
                <>
                  <h1>{renderText(section.title)}</h1>
                  {section.children[0] &&
                  section.children[0].type === "text" ? (
                    <p>{renderText(section.children[0].value)}</p>
                  ) : null}
                  <ul className="actions">
                    <li>
                      <a href="#first" className="arrow scrolly">
                        <span className="label">Next</span>
                      </a>
                    </li>
                  </ul>
                </>
              ) : (
                <h2>{renderText(section.title)}</h2>
              )}
            </header>
            <div className="content">
              {section.children.map(subsection =>
                subsection.type === "image" ? (
                  <span className={`image ${i === 0 ? "fill" : "main"}`}>
                    <NotionImage src={subsection.src} />
                  </span>
                ) : subsection.type === "text" ? (
                  i !== 0 && <p>{renderText(subsection.value)}</p>
                ) : subsection.type === "list" ? (
                  i !== 0 && (
                    <ul>
                      {subsection.children.map(child => (
                        <li>{renderText(child)}</li>
                      ))}
                    </ul>
                  )
                ) : null
              )}
            </div>
          </section>
        );
      })}
      <section>
        <header>
          <h2>JOIN THE MOVEMENT</h2>
        </header>
        <div className="content">
          <p>Make it happen</p>
          <ul className="actions">
            <li>
              <a
                href="www.gofundme.com/f/malda-soul-sisters-ngo-fundraiser"
                target="_blank"
                className="button primary large"
              >
                Join us!
              </a>
            </li>
            <li>
              <a
                href=""
                target="_blank"
                className="button large"
              >
                Learn more
              </a>
            </li>
          </ul>
        </div>
      </section>
      {<div className="copyright">
        Support our {" "}
        <a href="www.gofundme.com/f/malda-soul-sisters-ngo-fundraiser" target="_blank">
        fundraising          
        </a>{" "}
        &mdash; Come and{" "}
        <a href="https://www.instagram.com/maldasoulsisters/">say hi! </a>.
      </div>}

      <style jsx global>{`
        #wrapper > section > header:before,
        #wrapper > section > header h1:after, #wrapper > section > header h2:after,
        #wrapper > section > header h1:before, #wrapper > section > header h2:before,
        #wrapper > section:last-of-type > header:after,
        input[type="submit"].primary,
        input[type="reset"].primary,
        button.primary,
        .button.primary,
        input[type="checkbox"]:checked + label:before,
        input[type="radio"]:checked + label:before,
        input[type="checkbox"]:focus + label:before,
        input[type="radio"]:focus + label:before {
          background-color: ${color3.hex()};
          border-color: ${color3.hex()};
        }

        input[type="submit"]:hover,
        input[type="reset"]:hover,
        input[type="button"]:hover,
        button:hover,
        .button:hover {
          box-shadow: inset 0 0 0 2px ${color3.hex()};
          color: ${color3.hex()} !important;
        }

        input[type="submit"].primary:hover,
        input[type="reset"].primary:hover,
        input[type="button"].primary:hover,
        button.primary:hover,
        .button.primary:hover {
          background-color: ${color2.hex()};
          color: #000 !important;
        }

        #wrapper:before {
          background-color: ${color.hex()};
          
        }
      `}</style>
    </Layout>
  );
}

export async function unstable_getStaticProps() {
  const notionData = await getNotionData()
  const { sections, meta } = notionData

  const etag = require("crypto")
    .createHash("md5")
    .update(JSON.stringify(notionData))
    .digest("hex");

  return {
    props: {
      etag,
      meta,
      sections,
    },
    revalidate: 1
  }
};

function renderText(title) {
  return title.map(chunk => {
    let wrapper = <span>{chunk[0]}</span>;

    (chunk[1] || []).forEach(el => {
      wrapper = React.createElement(el[0], {}, wrapper);
    });

    return wrapper;
  });
}

function NotionImage({ src }) {
  if (src) {
    return <img title="image" src={src} />;
  } else {
    return <div />;
  }
}

const useFocus = () => {
  const [state, setState] = useState(null);
  const onFocusEvent = event => {
    setState(true);
  };
  const onBlurEvent = event => {
    setState(false);
  };
  useEffect(() => {
    window.addEventListener("focus", onFocusEvent);
    window.addEventListener("blur", onBlurEvent);
    return () => {
      window.removeEventListener("focus", onFocusEvent);
      window.removeEventListener("blur", onBlurEvent);
    };
  });
  return state;
};
