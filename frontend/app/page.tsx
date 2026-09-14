import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarWeek,
  faHandHoldingDollar,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import Footer from "@/components/Footer";
import HeroSlideshow from "@/components/HeroSlideshow";

export default function Home() {
  return (
    <main>
      <HeroSlideshow />

      <section className="px-5 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-navy">Our Success</h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            Built for the circles Ade already runs — eleven of them — and for
            anyone who is tired of arguing over whose week it is.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-8 text-center md:grid-cols-4">
          {[
            ["11+", "Circles in the brief"],
            ["1", "Payment a week"],
            ["2", "Kinds of caller"],
            ["0", "Double payments"],
          ].map(([n, label]) => (
            <div key={label}>
              <p className="text-4xl font-bold text-teal">{n}</p>
              <p className="mt-2 text-sm text-muted">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="bg-paper px-5 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-navy">All-in-one circle books</h2>
          <p className="mt-4 text-sm text-muted">
            One place for the pot, the turn, and the payout Ade is allowed to
            declare.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
          {[
            {
              color: "#5B72EE",
              icon: faCalendarWeek,
              title: "Pay in once a week",
              body: "The amount is fixed. A second contribution in the same week is refused — loudly.",
            },
            {
              color: "#00CBB8",
              icon: faUsers,
              title: "See whose turn it is",
              body: "Ask to join. Ade approves. Then the circle shows the pot, the order, and the next person.",
            },
            {
              color: "#29B9E7",
              icon: faHandHoldingDollar,
              title: "Payout to the right person",
              body: "Only the circle admin can declare it. A payout to the wrong member does not go through.",
            },
          ].map((card) => (
            <article key={card.title} className="card text-center">
              <span
                className="mx-auto grid h-16 w-16 place-items-center rounded-2xl text-white"
                style={{ background: card.color }}
              >
                <FontAwesomeIcon icon={card.icon} className="text-2xl" />
              </span>
              <h3 className="mt-6 text-lg font-semibold text-navy">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="px-5 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div className="rounded-[40px] bg-teal-pale p-10">
            <p className="text-sm font-semibold uppercase tracking-wide text-teal">
              What is an ajo?
            </p>
            <p className="mt-4 text-lg leading-8 text-navy">
              A group of people put the same amount in every week. Each week
              one member takes the whole pot, by turn, until everyone has
              had their week.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-navy">
              Everything you can do in a notebook, you can do in Ajo
            </h2>
            <p className="mt-5 text-sm leading-7 text-muted">
              Members ask to join, pay, and see history. Ade creates the circle,
              approves people, sets the order, and pays out. The bank&apos;s
              machine confirms a transfer with a key — it is not a person,
              so it never types a password.
            </p>
            <div className="mt-8 flex gap-4">
              <Link href="/register" className="btn-teal !bg-orange hover:!bg-orange-soft">
                For members
              </Link>
              <Link href="/login" className="btn-ghost">
                For Ade
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-paper px-5 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-navy">Our Features</h2>
          <p className="mt-3 text-sm text-muted">
            The rules Ade cannot keep in his head, kept by the service.
          </p>
        </div>
        <div className="mx-auto mt-14 flex max-w-5xl flex-col gap-16">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-2xl font-semibold text-navy">
                A dashboard for the week
              </h3>
              <ul className="mt-5 space-y-3 text-sm text-muted">
                <li> Who has paid, and who is behind.</li>
                <li> The pot for this week, in naira.</li>
                <li> The next name, not a guess.</li>
              </ul>
            </div>
            <div className="card">
              <p className="text-xs text-muted">Week 1 · Health</p>
              <div className="mt-4 space-y-2 text-sm">
                <p className="rounded-xl bg-teal-pale px-4 py-2">Lilian — paid</p>
                <p className="rounded-xl bg-peach px-4 py-2">Majesty — behind</p>
              </div>
            </div>
          </div>
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="card order-2 md:order-1">
              <p className="text-xs text-muted">Payout</p>
              <p className="mt-3 text-navy">
                This week&apos;s payout must go to Kosi.
              </p>
        
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-2xl font-semibold text-navy">
                The wrong name is refused
              </h3>
              <p className="mt-4 text-sm leading-7 text-muted">
                Members cannot declare a payout. Ade can — but only to the
                person whose turn it actually is.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal">
            From the chairman
          </p>
          <h2 className="mt-3 text-3xl font-bold text-navy">What they say</h2>
          <blockquote className="card mx-auto mt-10 max-w-xl text-left">
            <p className="text-sm leading-7 text-muted">
              “Eleven circles. I was adding naira in a book and still paying
              the wrong cousin. If the service will not let me do that, I
              can sleep.”
            </p>
            <p className="mt-6 text-sm font-semibold text-navy">Chairman Ade</p>
            <p className="text-xs text-muted">ade@ajo.com</p>
          </blockquote>
        </div>
      </section>

      <Footer />
    </main>
  );
}
