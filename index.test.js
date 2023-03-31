const postcss = require('postcss')

const plugin = require('./')

async function run (input, output, opts = { }) {
  let result = await postcss([plugin(opts)]).process(input, { from: undefined })
  expect(result.css).toEqual(output)
  expect(result.warnings()).toHaveLength(0)
}


it('rewrites simple URL', async () => {
  await run(
    `.test{ background: url("images/test.jpg"); }`,
    `.test{ background: url("https://example.com/images/test.jpg"); }`,
    { rootUrl: 'https://example.com' }
  )
})

it('skips host-relative URLs', async () => {
  await run(
    `.test{ background: url("/images/test.jpg"); }`,
    `.test{ background: url("/images/test.jpg"); }`,
    { rootUrl: 'https://example.com' }
  )
})

it('rewrites complex relative URLs', async () => {
  await run(
    `.test{ background: url("../../images/test.jpg"); }`,
    `.test{ background: url("https://example.com/wp/images/test.jpg"); }`,
    { rootUrl: 'https://example.com/wp/wp-themes/test/' }
  )
})

it('rewrites multiple simple URLs in one declaration', async () => {
  await run(
    `.test{ background: url("images/test.jpg"); mask: url("layout/shape.svg") center/contain no-repeat; }`,
    `.test{ background: url("https://example.com/images/test.jpg"); mask: url("https://example.com/layout/shape.svg") center/contain no-repeat; }`,
    { rootUrl: 'https://example.com' }
  )
})


it('skips what is not an URL', async () => {
  await run(
    `.test{ background: red; }`,
    `.test{ background: red; }`,
    { rootUrl: 'https://example.com/' }
  )
})

it('works with empty declaration', async () => {
  await run(
    `.test{}`,
    `.test{}`,
    { rootUrl: 'https://example.com/' }
  )
})

it('works with empty input', async () => {
  await run(
    ``,
    ``,
    { rootUrl: 'https://example.com/' }
  )
})
