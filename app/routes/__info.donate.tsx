import { Link } from "@remix-run/react";
import { generateMetaTags } from "@/lib/meta.js";

export function meta() {
  const title = "Support - web3.news: Empowering a User-Owned Web";
  const description =
    "Join the mission of web3.news to shape an open, decentralized web. Your support fuels our commitment to community-driven innovation, transparency, and education in the Web3 space. Help us maintain our ad-free, user-focused platform. Donate now to be a part of this transformative journey.";

  return [...generateMetaTags(title, description)];
}
export default function Page() {
  return (
    <article className="px-8 block text-gray-400 space-y-5">
      <h1 className="text-primary text-3xl leading-9">
        Building an Open, User-Owned Web Together
      </h1>
      <p className="text-white mt-3 leading-7">
        Our mission is clear:{" "}
        <strong>to create a web that is owned and shaped by its users</strong>.
        If we don't take the lead, others <strong>will</strong> shape it for us.
      </p>
      <p>
        Operated under the Lume Web project, web3.news exists for the
        community's benefit and is developed under the MIT license. We’re
        committed to <strong>transparency and open collaboration</strong>.
      </p>
      <p>
        At web3.news, we are dedicated to{" "}
        <strong>building technology, fostering community,</strong> and{" "}
        <strong>providing education</strong>. Our vision is powered by your
        participation and support.
      </p>
      <p>
        Currently, web3.news operates thanks to your generous donations and
        grant funding, at this time primarily from the{" "}
        <Link to="https://sia.tech/" className="text-white">
          <strong>Sia Foundation</strong>
        </Link>
        , a 501c3 blockchain foundation focused on decentralized storage. This
        significant support aligns closely with our mission of{" "}
        <strong>building an open and decentralized web</strong>. These
        contributions are vital for our ongoing operations and development,
        ensuring web3.news remains a vibrant and valuable resource for everyone,
        and paving the way for our future growth and sustainability.
      </p>
      <p>
        The support from the Sia Foundation not only bolsters our present
        efforts but also aligns with our vision of leveraging blockchain
        technology for{" "}
        <strong>decentralized information sharing and storage</strong>.
      </p>
      <p>
        Looking to the future, the Lume Web project is set to introduce
        separate, community-supported paid products. This strategic move aims to
        ensure the <strong>long-term sustainability of web3.news</strong> and
        the ongoing development of innovative solutions. Aligned with our core
        values and community focus, these products are envisioned as providing
        essential services and value back to the community, shaped in part by
        your feedback and participation.
      </p>
      <p>
        We pledge to maintain web3.news as a platform{" "}
        <strong>free from sponsorships and advertising</strong>, focusing on
        solving problems through collaboration and innovation.
      </p>
      <p>
        <strong>Join us in shaping the future of Web3.</strong>
      </p>
      <Link to="https://lumeweb.com/donate" aria-label="Support Our Mission">
        <button className="my-6 p-8 text-gray-500 bg-gray-800 hover:bg-gray-800/70">
          Support Our Mission
        </button>
      </Link>
    </article>
  );
}
