<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('compute.nic')" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="columns" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'

export default {
  name: 'VmDetachNetworkDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: this.$t('compute.detach_network_title'),
    }
  },
  computed: {
    columns () {
      const showFields = ['ifname', 'ip_addr', 'mac_addr']
      return this.params.columns.filter((item) => { return showFields.includes(item.field) })
    },
  },
  methods: {
    async doDetachSubmit () {
      const manager = new this.$Manager('servers')
      const params = {
        ip_addr: this.params.data[0].ip_addr,
      }
      return manager.performAction({
        id: this.params.data[0].guest_id,
        action: 'detachnetwork',
        data: params,
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.doDetachSubmit()
        this.loading = false
        this.params.refresh()
        this.$bus.$emit('VMInstanceListSingleRefresh', [this.params.data[0].guest_id, Object.values(expectStatus.server).flat()])
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
