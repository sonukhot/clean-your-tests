const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const {
  afterEach, beforeEach, describe, it } = require('mocha')
const employee = require('./employee')
const products = require('./products')
const pricing = require('../pricing')

chai.use(sinonChai)
const { expect } = chai


describe('Pricing', () => {

  describe('formatPrice', () => {
    it('returns a price with two decimal places not rounded when given a number with multiple decimal places', () => {
      const formattedprice = pricing.formatPrice(15.1566663)
      expect(formattedprice).to.equal(15.15)
    })
  })

  describe('calculateLTDPrice', () => {
    it('returns the price of an LTD plan for a single employee without employer contribution', () => {
      const selectedOptions = {
        familyMembersToCover: ['ee'],
        coverageLevel: [{ role: 'ee', coverage: 125000 }],
      }
      const price = pricing.calculateLTDPrice(products.longTermDisability, employee, selectedOptions)

      expect(price).to.equal(32.04)
    })

    it('returns the price for a disability product for an employee without employer contribution', () => {
      const selectedOptions = {
        familyMembersToCover: ['ee']
      }
      const price = pricing.calculateLTDPrice(products.longTermDisability, employee, selectedOptions)

      expect(price).to.equal(32.04)
    })

  })

  describe('calculateVolLifePrice', () => {
    it('returns the total price for a voluntary life product for a single employee without employer contribution', () => {
      const selectedOptions = {
        familyMembersToCover: ['ee'],
        coverageLevel: [{ role: 'ee', coverage: 125000 }],
      }
      const price = pricing.calculateVolLifePrice(products.voluntaryLife, selectedOptions)

      expect(price).to.equal(43.75)
    })
    it('returns the price for a voluntary life product for an employee with a spouse without employer contribution', () => {
      const selectedOptions = {
        familyMembersToCover: ['ee', 'sp'],
        coverageLevel: [
          { role: 'ee', coverage: 200000 },
          { role: 'sp', coverage: 75000 },
        ],
      }
      const price = pricing.calculateVolLifePrice(products.voluntaryLife, selectedOptions)

      expect(price).to.equal(79)
    })
  })

  describe('calculateVolLifePricePerRole', () => {
    it('return the VolLifePrice product for each role of employee', () => {
      const role = 'ee'
      const coverageLevel = [{ role: 'ee', coverage: 200000 },]

      const price = pricing.calculateVolLifePricePerRole(role, coverageLevel, products.voluntaryLife.costs)

      expect(price).to.equal(70)
    })
    it('return the VolLifePrice product for each role of employee', () => {
      const role = 'sp'
      const coverageLevel = [
        { role: 'sp', coverage: 75000 },
      ]

      const price = pricing.calculateVolLifePricePerRole(role, coverageLevel, products.voluntaryLife.costs)

      expect(price).to.equal(9)
    })
  })

  describe('getEmployerContribution', () => {
    it('returns the employer contribution for voluntary life product', () => {
      const price = 44.00
      const product = products.voluntaryLife
      employerContribution = pricing.getEmployerContribution(product.employerContribution, price)
      expect(employerContribution).to.equal(4.4)
    })

    it('returns the employer contribution for LTD product ', () => {
      const price = 44.00
      const product = products.longTermDisability
      employerContribution = pricing.getEmployerContribution(product.employerContribution, price)
      expect(employerContribution).to.equal(10)
    })
    it('returns the employer contribution for Commuter product', () => {
      const product = products.commuter
      employerContribution = pricing.getEmployerContribution(product.employerContribution)
      expect(employerContribution).to.equal(0)
    })
  })

  describe('calculateCommuterPrice', () => {
    it('returns the price for train commute', () => {
      const selectedOptions = {
        benefit: ['train']
      }
      const price = pricing.calculateCommuterPrice(products.commuter, selectedOptions)
      expect(price).to.equal(0)
    })

    it('returns the price for car commute', () => {
      const selectedOptions = {
        benefit: ['parking']
      }
      const price = pricing.calculateCommuterPrice(products.commuter, selectedOptions)
      expect(price).to.equal(0)
    })

    it('returns the price for invalid commute type', () => {
      const selectedOptions = {
        benefit: ['walking']
      }
      const price = pricing.calculateCommuterPrice(products.commuter, selectedOptions)
      expect(price).to.equal(0)
    })
  })
  describe('calculateProductPrice', () => {
    let calculateVolLifePriceSpy
    let calculateLTDPriceSpy
    let formatPriceSpy
    let getEmployerContributionSpy
    let sandbox

    beforeEach(() => {
      sandbox = sinon.createSandbox()
      calculateVolLifePriceSpy = sandbox.spy(pricing, 'calculateVolLifePrice')
      calculateLTDPriceSpy = sandbox.spy(pricing, 'calculateLTDPrice')
      formatPriceSpy = sandbox.spy(pricing, 'formatPrice')
      getEmployerContributionSpy = sandbox.spy(pricing, 'getEmployerContribution')
    })
    afterEach(() => {
      sandbox.restore()
    })

    it('returns the price for a voluntary life product for a single employee', () => {
      const selectedOptions = {
        familyMembersToCover: ['ee'],
        coverageLevel: [{ role: 'ee', coverage: 125000 }],
      }
      const price = pricing.calculateProductPrice(products.voluntaryLife, employee, selectedOptions)

      expect(price).to.equal(39.37)
      expect(calculateVolLifePriceSpy).to.have.callCount(1)
      expect(getEmployerContributionSpy).to.have.callCount(1)
      expect(formatPriceSpy).to.have.callCount(1)
      expect(calculateLTDPriceSpy).to.have.callCount(0)
    })

    it('returns the price for a voluntary life product for an employee with a spouse', () => {
      const selectedOptions = {
        familyMembersToCover: ['ee', 'sp'],
        coverageLevel: [
          { role: 'ee', coverage: 200000 },
          { role: 'sp', coverage: 75000 },
        ],
      }
      const price = pricing.calculateProductPrice(products.voluntaryLife, employee, selectedOptions)

      expect(price).to.equal(71.09)
      expect(calculateVolLifePriceSpy).to.have.callCount(1)
      expect(getEmployerContributionSpy).to.have.callCount(1)
      expect(formatPriceSpy).to.have.callCount(1)
      expect(calculateLTDPriceSpy).to.have.callCount(0)
    })

    it('returns the price for a disability product for an employee', () => {
      const selectedOptions = {
        familyMembersToCover: ['ee']
      }
      const price = pricing.calculateProductPrice(products.longTermDisability, employee, selectedOptions)

      expect(price).to.equal(22.04)
      expect(calculateLTDPriceSpy).to.have.callCount(1)
      expect(getEmployerContributionSpy).to.have.callCount(1)
      expect(formatPriceSpy).to.have.callCount(1)
      expect(calculateVolLifePriceSpy).to.have.callCount(0)
    })

    it('throws an error on unknown product type', () => {
      const unknownProduct = { type: 'vision' }

      expect(() => pricing.calculateProductPrice(unknownProduct, {}, {})).to.throw('Unknown product type: vision')
    })

  })
})

