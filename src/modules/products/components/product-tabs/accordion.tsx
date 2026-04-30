"use client"

import { Disclosure, Transition } from "@headlessui/react"
import { ChevronDown } from "lucide-react"
import React from "react"

type AccordionProps = {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

const Accordion: React.FC<AccordionProps> = ({ title, children, defaultOpen = false }) => {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <Disclosure defaultOpen={defaultOpen}>
        {({ open }) => (
          <>
            <Disclosure.Button className="flex items-center justify-between w-full py-4 text-left">
              <span className="text-[16px] font-bold uppercase tracking-wide text-gray-900">{title}</span>
              <ChevronDown
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </Disclosure.Button>
            <Transition
              enter="transition duration-150 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-100 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Disclosure.Panel className="pb-5 text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                {children}
              </Disclosure.Panel>
            </Transition>
          </>
        )}
      </Disclosure>
    </div>
  )
}

export default Accordion