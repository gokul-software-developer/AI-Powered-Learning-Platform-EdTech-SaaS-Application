import { cn } from "@/lib/utils";
import { Marquee } from "@/components/magicui/marquee";

const reviews = [
  {
    name: "Jack",
    username: "@jack",
    body: "I've never seen anything like this before. It's amazing. I love it.",
    img: "https://avatar.vercel.sh/jack",
  },
  {
    name: "Jill",
    username: "@jill",
    body: "I don't know what to say. I'm speechless. This is amazing.",
    img: "https://avatar.vercel.sh/jill",
  },
  {
    name: "John",
    username: "@john",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/john",
  },
  {
    name: "Jane",
    username: "@jane",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/jane",
  },
  {
    name: "Jenny",
    username: "@jenny",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/jenny",
  },
  {
    name: "James",
    username: "@james",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/james",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative h-full w-72 sm:w-64 md:w-72 lg:w-80 cursor-pointer overflow-hidden rounded-xl border p-6",
        "border-gray-300/20 bg-gray-50/10 transition-all duration-300 ease-in-out",
        "hover:bg-gray-50/40 hover:shadow-xl dark:border-gray-700/40 dark:bg-gray-900/20 dark:hover:bg-gray-900/30"
      )}
    >
      <div className="flex items-center gap-3">
        <img className="rounded-full w-12 h-12 shadow-md" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {name}
          </figcaption>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {username}
          </p>
        </div>
      </div>
      <blockquote className="mt-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        {body}
      </blockquote>
    </figure>
  );
};

function Testimonial() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden py-10">
      <Marquee pauseOnHover className="[--duration:16s]">
        {firstRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:16s] mt-5">
        {secondRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
    </div>
  );
}

const Testimonials = () => {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center px-6 md:px-12 py-16">
      {/* Heading Section */}
      <section className="max-w-2xl text-center space-y-6 pb-12">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Our Happy Clients
        </h1>
        <p className="text-lg font-normal leading-relaxed text-gray-600 dark:text-gray-400">
          Read the experiences of our satisfied clients. They{" "}
          <span className="font-semibold text-green-600 dark:text-green-400">
            truly value{" "}
          </span>
          <span className="text-green-500 dark:text-green-300">Study App</span> - Learning Solution.
        </p>
      </section>

      {/* Testimonial Section */}
      <Testimonial />
    </div>
  );
};

export default Testimonials;
