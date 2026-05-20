type MarqueeProps = {
  items: string[];
};

export function Marquee({ items }: MarqueeProps) {
  // Duplicate the items so the scroll loops cleanly.
  const doubled = [...items, ...items];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {doubled.map((item, i) => (
          <span key={i} className="marquee__item">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
