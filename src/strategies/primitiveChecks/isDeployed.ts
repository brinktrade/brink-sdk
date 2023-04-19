const isDeployed = async (address: string, provider: any) => {
  const code = await provider.getCode(address)
  return code !== '0x'
}

export default isDeployed