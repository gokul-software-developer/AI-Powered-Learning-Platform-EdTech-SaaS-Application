'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const paymentsPerPage = 5

const payments = [
  { id: 1, date: '2023-05-01', amount: 15, status: 'Paid' },
  { id: 2, date: '2023-04-01', amount: 15, status: 'Paid' },
  { id: 3, date: '2023-03-01', amount: 15, status: 'Paid' },
  { id: 4, date: '2023-02-01', amount: 15, status: 'Paid' },
  { id: 5, date: '2023-01-01', amount: 15, status: 'Paid' },
  { id: 6, date: '2022-12-01', amount: 15, status: 'Paid' },
  { id: 7, date: '2022-11-01', amount: 15, status: 'Paid' },
]

export default function PreviousPayments() {
  const [currentPage, setCurrentPage] = useState(1)

  const indexOfLastPayment = currentPage * paymentsPerPage
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage
  const currentPayments = payments.slice(indexOfFirstPayment, indexOfLastPayment)

  const totalPages = Math.ceil(payments.length / paymentsPerPage)

  return (
    <div>
      <Table>
        <TableCaption>A list of your recent payments</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentPayments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{payment.date}</TableCell>
              <TableCell>${payment.amount.toFixed(2)}</TableCell>
              <TableCell>{payment.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              isActive={currentPage !== 1}
            />
          </PaginationItem>
          {[...Array(totalPages)].map((_, i) => (
            <PaginationItem key={i}>
              <PaginationLink 
                onClick={() => setCurrentPage(i + 1)}
                isActive={currentPage === i + 1}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              isActive={currentPage !== totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

