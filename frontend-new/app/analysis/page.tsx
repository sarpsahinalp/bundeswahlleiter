import Link from "next/link"

export default function Analysis() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-2xl font-bold mb-4">Election Analysis</h2>
      <nav className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { href: "/analysis/seat-distribution", title: "Q1: Seat Distribution" },
          { href: "/analysis/parliament-members", title: "Q2: Parliament Members" },
          { href: "/analysis/constituency-overview", title: "Q3: Constituency Overview" },
          { href: "/analysis/constituency-winners", title: "Q4: Constituency Winners" },
          { href: "/analysis/overhang-seats", title: "Q5: Overhang Seats" },
          { href: "/analysis/closest-winners", title: "Q6: Closest Winners" },
          { href: "/analysis/constituency-details", title: "Q7: Constituency Details (Individual Votes)" },
          { href: "/analysis/socio-correlation", title: "Q8.1: Socio-Cultural Correlation" },
          { href: "/analysis/economic-correlation", title: "Q8.2: Economic Correlation" },
          { href: "/analysis/political-graph3d", title: "Q8.3D Graph Correlation"}
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
          >
            <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
            <p className="text-gray-600">Click to view analysis</p>
          </Link>
        ))}
      </nav>
    </div>
  )
}

