import { useLoaderData, Link } from "@remix-run/react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { prisma } from "@/lib/prisma";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Article } from "@prisma/client";

// Loader function to fetch article data
export async function loader({ params }: LoaderFunctionArgs) {
  const { cid } = params;
  const article = await prisma.article.findUnique({
    where: { cid },
  });

  if (!article) {
    throw new Response("Not Found", { status: 404 });
  }

  return article;
}

const Page = () => {
  // Use the loader data
  const article = useLoaderData() as unknown as Article;

  return (
    <>
      <Link to="/" className="w-full mt-1">
        <button className="px-3 py-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded">
          <ArrowLeftIcon className="w-4 h-4 inline mr-2 -mt-1" />
          Go Back Home
        </button>
      </Link>
      <div className="w-full min-h-[calc(100%-80px)] !h-full !mt-1 !mb-0">
        <iframe
          className="w-full h-full"
          src={article.url}
          title={article.title}
        ></iframe>
      </div>
    </>
  );
};

export default Page;
