import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Check, ChevronLeft, ChevronRight, Search, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import BookingDialog from '@/components/BookingDialog';
import { fetchPublicServices } from '@/lib/services-api';
import { scrollToSection } from '@/components/Navbar';

const PAGE_SIZE = 48;

const TestDirectorySection = () => {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(1);

  // Debounce typing so we don't hit the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['public-services', { search, department, page }],
    queryFn: ({ signal }) => fetchPublicServices({ search, department, page, limit: PAGE_SIZE }, signal),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Keep the full department list stable once loaded (it shouldn't shrink when filtering)
  const [departments, setDepartments] = useState<string[]>([]);
  useEffect(() => {
    if (data?.departments?.length && departments.length === 0) setDepartments(data.departments);
  }, [data, departments.length]);

  const selectDepartment = (dept: string) => {
    setDepartment(dept);
    setPage(1);
  };

  const goToPage = (next: number) => {
    setPage(next);
    scrollToSection('test-directory');
  };

  const services = data?.services ?? [];
  const totalPages = data?.total_pages ?? 1;

  return (
    <section className="py-20" style={{ backgroundColor: '#F4FFF8' }}>
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-10 max-w-3xl">
          <div className="inline-block mb-4">
            <span className="text-emerald-500 font-medium text-sm tracking-wider uppercase border-l-4 border-emerald-500 pl-3">
              TEST DIRECTORY
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Find Your <span className="text-emerald-500">Test</span>
          </h2>
          <p className="text-gray-600 text-base leading-relaxed">
            Search our complete list of tests and diagnostic services, or filter by department.
            Choose a test to book, then review the price and pay on our secure checkout.
            Contact us for preparation guidance or availability.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xl mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for a test or department…"
            className="w-full h-12 pl-12 pr-4 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            aria-label="Search services"
          />
        </div>

        {/* Department filter */}
        {departments.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-8 -mx-6 px-6 lg:flex-wrap lg:overflow-visible">
            {['', ...departments].map((dept) => {
              const active = department === dept;
              return (
                <button
                  key={dept || 'all'}
                  onClick={() => selectDepartment(dept)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm border transition-colors ${
                    active
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-emerald-400 hover:text-emerald-600'
                  }`}
                >
                  {dept || 'All'}
                </button>
              );
            })}
          </div>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl bg-white" />
            ))}
          </div>
        ) : isError ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
            <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-700 mb-6">We couldn't load our services right now.</p>
            <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              Try again
            </Button>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-600">
            No services match your search.
          </div>
        ) : (
          <>
            {data && (
              <p className="text-sm text-gray-500 mb-4">
                {data.count.toLocaleString()} service{data.count === 1 ? '' : 's'}
                {department && <> in <span className="font-medium text-gray-700">{department}</span></>}
              </p>
            )}
            <ul
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity ${
                isFetching ? 'opacity-60' : 'opacity-100'
              }`}
            >
              {services.map((service) => (
                <li
                  key={service.id}
                  className="flex flex-col gap-5 bg-white border border-gray-200 rounded-xl p-5 hover:border-emerald-400 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-gray-900 font-semibold leading-snug break-words">{service.name}</h3>
                      <p className="mt-2 text-sm text-gray-600 break-words">{service.department}</p>
                      <p className="mt-1 text-xs text-emerald-700">{service.category}</p>
                    </div>
                  </div>
                  <BookingDialog service={service} />
                </li>
              ))}
            </ul>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-10">
                <Button
                  variant="outline"
                  onClick={() => goToPage(Math.max(1, page - 1))}
                  disabled={page <= 1 || isFetching}
                  className="bg-white"
                >
                  <ChevronLeft /> Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => goToPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages || isFetching}
                  className="bg-white"
                >
                  Next <ChevronRight />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default TestDirectorySection;
