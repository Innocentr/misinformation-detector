function PageIntro({ eyebrow, title, description, aside }) {
  return (
    <section className="page-intro">
      <div className="page-intro__content">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {description ? <p className="page-intro__description">{description}</p> : null}
      </div>
      {aside ? <div className="page-intro__aside">{aside}</div> : null}
    </section>
  );
}

export default PageIntro;
